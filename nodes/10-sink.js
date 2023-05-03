module.exports = function(RED) {
  function SinkFunctionality(config) {
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
  RED.nodes.registerType("Sink", SinkFunctionality);
}
