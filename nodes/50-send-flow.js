module.exports = function(RED) {
  function SendFlowFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      var sendFlow = (hdrs, got) => {

        RED.util.evaluateNodeProperty(cfg.hostUrl, cfg.hostUrlType, node, msg, (err, result) => {
            if (err) {
              node.status({ fill: "red", shape: "dot", text: "Failed" });
              node.error("unable to obtain host url", { ...msg, _err: err })
            } else {
              got.post( result + "/flows", {
                headers: {
                  "Node-RED-API-Version":     cfg.flowVersion,
                  "Content-type":	            "application/json",
                  "Node-RED-Deployment-Type": "full",
                  ...hdrs
                },
                body: JSON.stringify(msg.payload)
              }).then( res => {
                send({
                  ...msg,
                  payload: res.body
                });

                node.status({fill:"green",shape:"dot",text:"Good"});
                setTimeout( function() {
                  node.status({})
                }, 450);

              }).catch( err => {
                node.status({fill:"red",shape:"dot",text:"Failed"});
                node.error("posting data to host", { ...msg, _err: err})
              });
            }
        })
      };

      /**
      * Authentication
      **/
      if ( cfg.useAuthentication ) {
        var username = undefined;
        var password = undefined;

        node.status({fill:"blue",shape:"dot",text:"Requesting token"});

        RED.util.evaluateNodeProperty(cfg.apiUsername, cfg.apiUsernameType, node, msg, (err, result) => {
          if (err) {
            node.status({fill:"red",shape:"dot",text:"Failed"});
            node.error("unable to obtain api username", { ...msg, _err: err})
          } else {
            username = result;

            RED.util.evaluateNodeProperty(cfg.apiPassword, cfg.apiPasswordType, node, msg, (err, result) => {
              if (err) {
                node.status({fill:"red",shape:"dot",text:"Failed"});
                node.error("unable to obtain api password", {...msg, _err: err})
              } else {
                password = result;

                var data = {
                      "client_id":  "node-red-admin",
                      "grant_type": "password",
                      "scope":      "*",
                      "username":   username,
                      "password":   password
                }

                RED.util.evaluateNodeProperty(cfg.hostUrl, cfg.hostUrlType, node, msg, (err, result) => {
                  if (err) {
                    node.status({ fill: "red", shape: "dot", text: "Failed" });
                    node.error("error occurred", { ...msg, _err: err })
                  } else {
                    
                    import('got').then( (module) => {
                      module.got.post( result + "/auth/token", {
                        json: data
                      }).then( res => {
                        node.status({
                          fill:"blue",
                          shape:"dot",
                          text:"Sending flow"
                        });

                        var access_token = JSON.parse(res.body).access_token;

                        sendFlow({
                          "Authorization": "Bearer " + access_token
                        }, module.got);

                      }).catch((err) => {
                        node.status({fill:"red",shape:"dot",text:"Failed"});
                        node.error( "unable to obtain api auth token", { ...msg, _err: err });
                      });
                    });
                  }
                })
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
          sendFlow({}, module.got);
        });
      }
    });
  }

  RED.nodes.registerType("SendFlow", SendFlowFunctionality);
}
