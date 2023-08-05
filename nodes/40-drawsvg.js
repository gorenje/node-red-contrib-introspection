module.exports = function(RED) {
  function DrawSVGFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      RED.comms.publish("introspect:drawsvg", RED.util.encodeObject({
        payload: msg.payload,
        msg: "svgdata",
      }));

      node.status({ fill: "green", shape: "dot", text: "SVG Data sent" });
      setTimeout( () => { node.status({}) }, 1432 );

      send(msg);
    });
  }
  RED.nodes.registerType("DrawSVG", DrawSVGFunctionality);
}
