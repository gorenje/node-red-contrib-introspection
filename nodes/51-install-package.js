module.exports = function(RED) {
  function InstallPackageFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {

      if (!msg.payload || Object.prototype.toString.call(msg.payload) !== '[object Object]') {
        return node.error("msg.payload missing or payload not hash", msg)
      }

      var installPackage = (hdrs, got) => {
        let body = undefined
        let headers = {}

        if ( msg.payload.module  ) {
          body = JSON.stringify({
            module: msg.payload.module,
            version: msg.payload.version || "latest"
          })

          headers = {
            "Content-Type": "application/json"
          }
        } else if ( msg.payload.data && Buffer.isBuffer(msg.payload.data) ) {

          let formData = require('form-data')
          body = new formData();
          body.append("tarball", msg.payload.data, "tarball.tgz");
          headers = body.getHeaders()
          body = body.getBuffer()

        } else {
          return node.error("msg.payload not well defined", msg)
        }

        got.post( (cfg.hostUrl || msg.hostUrl) + "/nodes", {
          headers: {
            ...headers,
            ...hdrs
          },          
          body: body
        }).then( res => {
          send({
            ...msg,
            payload: JSON.parse(res.body)
          });

          node.status({fill:"green",shape:"dot",text:"Good"});
          setTimeout( function() {
            node.status({})
          }, 450);

        }).catch( err => {
          node.status({fill:"red",shape:"dot",text:"Failed"});
          node.error("error occurred", { ...msg, _err: err })
        });
      };

      /**
      * Authentication
      **/
      if ( cfg.useAuthentication ) {
        var username = undefined;
        var password = undefined;

        node.status({fill:"blue",shape:"dot",text:"Requesting token"});

        RED.util.evaluateNodeProperty(cfg.apiUsername, cfg.apiUsernameType,
                                      node, msg, (err, result) => {
          if (err) {
            node.status({fill:"red",shape:"dot",text:"Failed"});
            node.error("error occurred", { ...msg, _err: err})
          } else {
            username = result;

            RED.util.evaluateNodeProperty(cfg.apiPassword, cfg.apiPasswordType,
                                          node, msg, (err, result) => {
              if (err) {
                node.status({fill:"red",shape:"dot",text:"Failed"});
                node.error("error occurred", { ...msg, _err: err} )
              } else {
                password = result;

                var data = {
                      "client_id":  "node-red-admin",
                      "grant_type": "password",
                      "scope":      "*",
                      "username":   username,
                      "password":   password
                }

                import('got').then( (module) => {
                  module.got.post( (cfg.hostUrl || msg.hostUrl) + "/auth/token", {
                    json: data
                  }).then( res => {
                    node.status({
                      fill:"blue",
                      shape:"dot",
                      text:"Sending flow"
                    });

                    var access_token = JSON.parse(res.body).access_token;

                    installPackage({
                      "Authorization": "Bearer " + access_token
                    }, module.got);

                  }).catch((err) => {
                    node.status({fill:"red",shape:"dot",text:"Failed"});
                    node.error( "error occured", { ...msg, _err: err } );
                  });
                });
              }
            })
          }
        })
      } else {
        /*
         * Authentication free zone...
         */
        node.status({fill:"blue",shape:"dot",text:"Sending flow"});
        import('got').then( (module) => {
          installPackage({}, module.got);
        });
      }
    });
  }

  RED.nodes.registerType("InstallPackage", InstallPackageFunctionality);
}
