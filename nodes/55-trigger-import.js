module.exports = function(RED) {
  function TriggerImportFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      RED.comms.publish("introspect:trigger-import-tripped",
                        RED.util.encodeObject({
                          flowContent: msg.payload,
                          msg: "import-flow",
                          autoimport: cfg.autoimport
                        })
      );

      send(msg);
    });
  }
  RED.nodes.registerType("TriggerImport", TriggerImportFunctionality);
}
