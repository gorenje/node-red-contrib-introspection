module.exports = function(RED) {
  function TriggerImportFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      if ( msg.payload && msg.payload.cmd == "delete-nodes" ) {
        RED.comms.publish('introspect:trigger-import-delete',
                          RED.util.encodeObject({
                            msg:     "delete-old-nodes",
                            payload: msg.payload,
                          })
        );

        send(msg);
        return;
      }

      RED.comms.publish("introspect:trigger-import-tripped",
                        RED.util.encodeObject({
                          flowContent:      msg.payload,
                          msg:              "import-flow",
                          autoimport:       cfg.autoimport,
                          removeduplicates: cfg.removeduplicates,
                        })
      );

      send(msg);
    });
  }
  RED.nodes.registerType("TriggerImport", TriggerImportFunctionality);
}
