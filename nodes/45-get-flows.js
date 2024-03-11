module.exports = function(RED) {
  function GetFlowsFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      var os = require('os');

      var baseUrl = "http://" + os.hostname() + ":" + RED.settings.get("uiPort");
      if ( RED.settings.get("httpAdminRoot") != "/" ) {
        baseUrl += RED.settings.get("httpAdminRoot");
      }

      var getFlows = (hdrs, got) => {
        got.get( baseUrl + "/flows", {
          headers: {
            "Node-RED-API-Version": cfg.flowVersion,
            ...hdrs
          }
        }).then( res => {
          var bodySize = res.body.length;

          send({
            ...msg,
            payload: res.body
          });

          node.status({fill:"green",shape:"dot",text:"Good"});
          setTimeout( function() {
            node.status({
              fill:  "blue",
              shape: "dot",
              text:  "Flow size: " + bodySize
            })
          }, 450);

        }).catch( err => {
          node.status({fill:"red",shape:"dot",text:"Failed"});
          node.error("error occurred", { ...msg, _err: err})
        });
      };

      if ( cfg.useAuthentication ) {
        var username = undefined;
        var password = undefined;

        node.status({fill:"blue",shape:"dot",text:"Requesting token"});

        RED.util.evaluateNodeProperty(cfg.apiUsername, cfg.apiUsernameType,
                                      node, msg, (err, result) => {
          if (err) {
            node.status({fill:"red",shape:"dot",text:"Failed"});
            node.error("error occurred", {...msg, _err:err})
          } else {
            username = result;

            RED.util.evaluateNodeProperty(cfg.apiPassword, cfg.apiPasswordType,
                                          node, msg, (err, result) => {
              if (err) {
                node.status({fill:"red",shape:"dot",text:"Failed"});
                node.error("error occurred", { ...msg, _err: err })
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
                  module.got.post( baseUrl + "/auth/token", {
                    json: data
                  }).then( res => {
                    node.status({
                      fill:"blue",
                      shape:"dot",
                      text:"Requesting flows"
                    });

                    var access_token = JSON.parse(res.body).access_token;

                    getFlows({
                      "Authorization": "Bearer " + access_token
                    }, module.got);

                  }).catch((err) => {
                    node.status({fill:"red",shape:"dot",text:"Failed"});
                    node.error( "error occurred", {...msg, _err: err });
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
        node.status({fill:"blue",shape:"dot",text:"Requesting flows"});
        import('got').then( (module) => {
          getFlows({}, module.got);
        });
      }
    });
  }

  RED.nodes.registerType("GetFlows", GetFlowsFunctionality);
}
