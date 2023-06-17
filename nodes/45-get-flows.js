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

      var url = "http://" + os.hostname() + ":" + RED.settings.get("uiPort");
      if ( RED.settings.get("httpAdminRoot") != "/" ) {
        url += RED.settings.get("httpAdminRoot");
      }
      url += "/flows";

      node.status({fill:"blue",shape:"dot",text:"Requesting..."});

      got.get( url ).then( res => {
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
      });
    });
  }
  RED.nodes.registerType("GetFlows", GetFlowsFunctionality);
}
