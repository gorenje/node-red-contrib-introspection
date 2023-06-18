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
      var got = require('got');

      var baseUrl = "http://" + os.hostname() + ":" + RED.settings.get("uiPort");
      if ( RED.settings.get("httpAdminRoot") != "/" ) {
        baseUrl += RED.settings.get("httpAdminRoot");
      }

      if ( cfg.useAuthentication ) {
        var username = undefined;
        var password = undefined;

        node.status({fill:"blue",shape:"dot",text:"Requesting token"});

        RED.util.evaluateNodeProperty(cfg.apiUsername, cfg.apiUsernameType,
                                      node, msg, (err, result) => {
          if (err) {
            node.status({fill:"red",shape:"dot",text:"Failed"});
            node.error(err)
          } else {
            username = result;

            RED.util.evaluateNodeProperty(cfg.apiPassword, cfg.apiPasswordType,
                                          node, msg, (err, result) => {
              if (err) {
                node.status({fill:"red",shape:"dot",text:"Failed"});
                node.error(err)
              } else {
                password = result;

                var data = {
                      "client_id":  "node-red-admin",
                      "grant_type": "password",
                      "scope":      "*",
                      "username":   username,
                      "password":   password
                }

                got.post( baseUrl + "/auth/token", {
                  json: data
                }).then( res => {
                  node.status({fill:"blue",shape:"dot",text:"Requesting flows"});

                  var access_token = JSON.parse(res.body).access_token;
                  got.get( baseUrl + "/flows", {
                    headers: {
                      "Node-RED-API-Version": cfg.flowVersion,
                      "Authorization": "Bearer " + access_token
                    }
                  }).then( res => {
                    node.status({fill:"green",shape:"dot",text:"Good"});
                    setTimeout( function() { node.status({}) }, 450);
                    send( {
                      ...msg,
                      payload: res.body
                    });
                  }).catch( err => {
                    node.status({fill:"red",shape:"dot",text:"Failed"});
                    node.error(err)
                  });
                }).catch((err) => {
                  node.status({fill:"red",shape:"dot",text:"Failed"});
                  node.error( err );
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

        got.get( baseUrl + "/flows",
                 {headers: {"Node-RED-API-Version": cfg.flowVersion}}
        ).then( res => {
          if ( res.statusCode == 200 ) {
            send( {
              ...msg,
              payload: res.body
            });
            node.status({fill:"green",shape:"dot",text:"Good"});
            setTimeout( function() { node.status({}) }, 450);
          } else {
            node.error( res );
            node.status({fill:"red",shape:"dot",text:"Failed"});
          }
        }).catch( err => {
          node.status({fill:"red",shape:"dot",text:"Failed"});
          node.error(err)
        });
      }
    });
  }
  RED.nodes.registerType("GetFlows", GetFlowsFunctionality);
}
