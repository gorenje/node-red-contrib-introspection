module.exports = function(RED) {
  function NavigatorFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input",function(msg, send, done) {
      send(msg);
    });
  }
  RED.nodes.registerType("Navigator", NavigatorFunctionality);
}
