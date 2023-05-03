module.exports = function(RED) {
  function ScreenshotFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      RED.comms.publish("introspect:" + node.id, RED.util.encodeObject({
        msg: "timer-tripped",
      }));

      node.status({ fill: "green", shape: "dot", text:"Taking screenshot" });
      setTimeout( () => { node.status({}) }, 1432 );

      send(msg);
    });
  }
  RED.nodes.registerType("Screenshot", ScreenshotFunctionality);
}
