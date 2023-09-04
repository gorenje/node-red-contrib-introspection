module.exports = function(RED) {
  function ClientCodeFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    node.on('close', function() {
      node.status({});
    });

    node.on("input", function(msg, send, done) {
      RED.comms.publish(
        "introspect:client-code-perform",
        RED.util.encodeObject({
          msg:     "execfunc",
          payload: msg.payload,
          topic:   msg.topic,
          func:    cfg.clientcode,
          nodeid:  node.id
        })
      );
    });
  }
  RED.nodes.registerType("ClientCode", ClientCodeFunctionality);

  RED.httpAdmin.post("/ClientCode/:id",
                     RED.auth.needsPermission("ClientCode.write"),
                     (req,res) => {
                       var node = RED.nodes.getNode(req.params.id);
                       if (node != null) {
                         try {
                           if (req.body && node.type == "ClientCode" ) {
                             node.send(req.body);
                           } else {
                             res.sendStatus(404);
                           }
                           res.sendStatus(200);
                         } catch(err) {
                           res.sendStatus(500);
                           node.error("ClientCode: Submission failed: " +
                                      err.toString())
                         }
                       } else {
                         res.sendStatus(404);
                       }
                     });

}
