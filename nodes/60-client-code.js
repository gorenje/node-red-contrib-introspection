module.exports = function(RED) {
  let UglifyJS = require('uglify-js');
  let CleanCSS = require('clean-css');

  const OnReceiveHookName = "onReceive.introspectionMsgTracer"
  const OnPreuninstallHookName = "preUninstall.introspectionMsgTracer"
  const debugLength = RED.settings.debugMaxLength || 1000 

  function msgTracerOnReceiveHook(evnt) {
    try {
      let nde = RED.nodes.getNode(evnt.destination.id)

      nde.status({ fill: "green", shape: "ring", text: "msg received" })
      setTimeout(() => { nde.status({}) }, 1000)

      RED.comms.publish("msgtracer:node-received",
        RED.util.encodeObject({
          nodeid: evnt.destination.id
        })
      )

      return nde
    } catch (ex) {
      console.error(ex)
    }
  }

  function msgTracerOnReceiveHookWithDebug(evnt) {
    try {
      let nde = msgTracerOnReceiveHook(evnt)

      // taken from the [debug node](https://github.com/node-red/node-red/blob/2854351909dee9f92597faba3f37239134294eec/packages/node_modules/%40node-red/nodes/core/common/21-debug.js#L227)
      let msg = { 
        id:     nde.id, 
        z:      nde.z, 
        _alias: nde._alias,  
        path:   nde._flow.path, 
        name:   nde.name, 
        topic:  evnt.msg.topic, 
        msg:    evnt.msg
      }

      msg = RED.util.encodeObject(msg, { maxLength: debugLength });
      RED.comms.publish("debug",msg);
      
    } catch (ex) {
      console.error(ex)
    }
  }

  function ClientCodeFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      // msg object may cause problem if there are circular references, so
      // do a pre-stringify before erroring out.
      try {
        JSON.stringify(msg)
      } catch (e) {
        msg = `[Error in JSON.stringify(msg)]\n${e}\n[End Error]\n`
      }

      RED.comms.publish(
        "introspect:client-code-perform",
        RED.util.encodeObject({
          msg:     "execfunc",
          payload: msg.payload,
          topic:   msg.topic,
          func:    cfg.clientcode,
          nodeid:  node.id,
          _msg:    msg
        })
      );
    });
  }
  RED.nodes.registerType("ClientCode", ClientCodeFunctionality);

  /**
   * These are the two endpoints for the message tracer functionality.
   * Rather badly placed in the ClientCode node code but the author
   * didn't find a better place. The world is confusing, why should 
   * this codebase be any different.
   */
  RED.httpAdmin.post("/MsgTracer/msgtracing/on",
    RED.auth.needsPermission("ClientCode.write"),
    (req, res) => {
      try {
        RED.hooks.remove(OnReceiveHookName)
        if ( req.body.withDebug ) {
          RED.hooks.add(OnReceiveHookName, msgTracerOnReceiveHookWithDebug)
        } else {
          RED.hooks.add(OnReceiveHookName, msgTracerOnReceiveHook)
        }

        // add hook on uninstall package so that the hook for the
        // message tracer is removed on uninstall of this package.
        RED.hooks.remove(OnPreuninstallHookName)
        RED.hooks.add(OnPreuninstallHookName, (evnt) => {
          if (evnt.module == "@gregoriusrippenstein/node-red-contrib-introspection") {
            RED.hooks.remove(OnReceiveHookName)
            RED.hooks.remove(OnPreuninstallHookName)
          }
        })

        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500);
      }
    });

  RED.httpAdmin.post("/MsgTracer/msgtracing/off",
    RED.auth.needsPermission("ClientCode.write"),
    (req, res) => {
      try {

        RED.hooks.remove(OnReceiveHookName)
        RED.hooks.remove(OnPreuninstallHookName)

        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500);
      }
    });

  RED.httpAdmin.post("/ClientCode/:id",
    RED.auth.needsPermission("ClientCode.write"),
    (req,res) => {
      var node = RED.nodes.getNode(req.params.id);
      if (node != null) {
        try {
          if (req.body && node.type == "ClientCode" ) {
            node.send(req.body);
            res.sendStatus(200);
          } else {
            res.sendStatus(404);
          }
        } catch(err) {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(404);
      }
    });

  RED.httpAdmin.post("/ClientCode/:id/status",
    RED.auth.needsPermission("ClientCode.write"),
    (req, res) => {
      var node = RED.nodes.getNode(req.params.id);
      if (node != null) {
        try {
          if (req.body && node.type == "ClientCode") {
            node.status(req.body);
            res.sendStatus(200);
          } else {
            res.sendStatus(404);
          }
        } catch (err) {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(404);
      }
    });

  RED.httpAdmin.post("/ClientCode/:id/ugify",
    RED.auth.needsPermission("ClientCode.write"),
    (req, res) => {
      try {
        if (req.body ) {
          req.body.nodes.forEach( n => {

            if (n.format == "css" && !/[@]obfuscate-ignore/.test(n.template) ) {
              let output = new CleanCSS(req.body.csscfg).minify(n.template);
              if ( output.styles && (output.errors || []).length == 0 ) {
                n.template = output.styles
              } else {
                n._error = output.errors
                n._cssoutput = output
              }
            }

            if (n.format == "json" && !/[@]obfuscate-ignore/.test(n.template)) {
              let result = {}
              try {
                result.code = JSON.stringify(JSON.parse(n.template))
              } catch (ex) {
                result.error = ex
              }

              if (result.code && !result.error) {
                n.template = result.code
              } else {
                n._error = result.error
                n._code = result.code
              }
            }

            if (n.format == "javascript" && !/[@]obfuscate-ignore/.test(n.template)) { 
              /* this handles PkgFile nodes and template nodes */
              let result = UglifyJS.minify(n.template, req.body.jscfg)

              if ( result.code && !result.error) {               
                n.template = result.code
              } else { 
                n._error = result.error
                n._code = result.code
              }
            }

            if (n.type == "function" && !/[@]obfuscate-ignore/.test(n.func)) {
              let result = UglifyJS.minify(n.func, req.body.jscfg)

              if (result.code && !result.error) {
                n.func = result.code                
              } else {
                n._error = result.error
                n._code = result.code
              }
            }
            
          })
          res.status(200).send(req.body.nodes);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.sendStatus(500);
      }
    });


}
