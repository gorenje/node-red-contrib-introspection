module.exports = function(RED) {
  let UglifyJS = require('uglify-js');
  let CleanCSS = require('clean-css');

  function ClientCodeFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
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
          node.error("ClientCode: Submission failed: " +
                    err.toString())
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
          node.error("ClientCode: Submission failed: " +
            err.toString())
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
        node.error("ClientCode: Submission failed: " +
          err.toString())
      }
    });


}
