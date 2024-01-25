# Node-RED Introspection Nodes

This is a collection of editor-only Node-RED nodes. Editor-only since they do not have any affect nor application on the server side, these nodes solely work within the editor, that is, the browser environment.

## Why?

The Node-RED editor is a powerful beast with many abilities, why not use them? Why not make use of those possibilities and create a set of introspection nodes, a form of visual linting before deployment. The editor already does syntax checking before deployment, why limit it to just that?

I found myself working on various flows and found some particular artistic but I wanted to scale them to poster size, hence I needed an SVG dump. Having not found what I was looking for, I created my own Screenshot node.

Orphans node many or many not have their reasons, sometimes nodes aren't meant to be there and can actually be deleted. Either way, nodes that have no connections, either in nor out, *might* no longer be needed. For me, orphan nodes represent commented-out code or code that can't be reached, so they potentially represent nostalgia, a nostalgia for coding ideas that are no longer valid.

Sometimes I found myself having extremely complex flows, flows that went over multiple tabs via the link-in/out nodes. I was lost as to how specific nodes were ever reached. The birth of the Sink & Seeker nodes was inevitable.

## Sidebar Nodes

There is no need nor requirement to deploy these nodes. Which implies that they also work in read-only mode of Node-RED. Since these nodes only provide information and make no changes, this should not be an issue.

### Screenshot

**Update**: Screenshot node has become a sidebar node. This means it can no longer be triggered by external forces.

![img](https://cdn.openmindmap.org/content/1699269615464_Screen_Shot_2023-11-06_at_12.20.09.png)

Drag the node into a flow, double-click on the node and the tray opens -depending on the size of the flow, this might take a moment. Once the tray is opened, the SVG is shown in the editor window (I took the code from the template node hence the syntax dropdown). Below the editor window is the download button. Pressing that will download the SVG as it is in the editor window, so making changes in that window will be reflected in the downloaded content.

The SVG code can also be copied and pasted into something like [drawsvg.org](https://drawsvg.org/drawsvg.html) hence select-all-copy-paste is provided by having the editor window.

Improvements over [svgexport.io](https://svgexport.io) browser plugin:

- Respects the 'hide' CSS class that is used to hide specific elements, this is something that the svgexport plugin cannot know.
- Compliments the setting of visibility on the 'g' element with opacity=0. The SVG Standard ignores visibility on 'g' elements but browsers don't seem to care, Inkscape does care.
- Image data (i.e. icons) is inlined using `data:image/XXXX;base64,` - this is good for things such as Inkscape that can't resolve relative urls. PNG, JPEG and SVG are supported.
- It also retrieves font details and includes them in the SVG. This makes the font italic, even if it's not the correct font family (because font might not be installed on system).

Disappointments:

- Font-awesome icons, because they use the font-awesome font, aren't inlined and therefore aren't available in external tools. If the font-awesome fonts are installed on the system icons do work in Inkscape and browser.
- Limited testing: Firefox & Opera (on mac), your mileage might vary
- No error checking - network requests are assumed to work

### Orphans

**Update**: This is now a sidebar plugin which shows all unconnected nodes across alls flow tabs.

~~Drag the Orphan node into a flow, double click and all nodes that have no connections are shown in the tray. Click on a node to highlight its location in the flow.~~

![img](https://cdn.openmindmap.org/content/1699272147285_Screen_Shot_2023-11-06_at_13.02.22.png)

Clicking on a node will highlight that node in the workspace. The nodes shown are across all flows and tabs. 

### Obfuscate

![img](https://cdn.openmindmap.org/content/1706184273430_Screen_Shot_2024-01-25_at_13.04.17.png)

Sidebar for visually obfuscating flows:

![img](https://cdn.openmindmap.org/content/1706183691592_obsfucate3.gif)

The plugin replaces the name with the node Id, resets the nodes info content to empty and moves all nodes to the same location. The intention is to having a *working* flow but not an *understandable* flow. The generated flow is meant to be only usable and not modifiable nor maintainable.

## Palette Nodes

### Sink & Seeker

Place the sink node at the end of a any flow, the point that needs to be reached. Place the seeker at the starting point. Double click on the seeker to open the tray and all possible paths (if there are any) between it and the sink are shown.

Double click on the top-level node and all nodes in the pathway are highlighted. Opening the top-level node shows all nodes along the path. Clicking on a node will highlight that node in flow.

### GetFlows

Node retrieves the current `flows.json` from the server but using the [Node-RED API](https://nodered.org/docs/api/admin/methods/get/flows/) so that it is storage independent. It returns the flows as a `payload` of the message.

The intention that this is triggered on a regular basis to backup the flows to a third party storage system. Recommended is usage in combination with the [zip](https://flows.nodered.org/node/node-red-contrib-zip) module to make the backups smaller.

GetFlows supports version selection of the flows and it has limited authentication using password `grant_type`.

Inspired by the [dsm](https://flows.nodered.org/node/node-red-contrib-dsm) package that has a [backup](https://github.com/cflurin/node-red-contrib-dsm/wiki/Backup) state machine.

### SendFlow

Send a flow to another Node-RED instance. This will replace **any existing** flows on the other server, use with care. Under the hood this uses the [Node-RED API](https://nodered.org/docs/api/admin/methods/post/flows/) to post a new flow to the server. This node also supports authentication if the other server happens to have some.

### ClientCode

ClientCode is a node for executing client side, i.e., in the editor, Javascript code triggered by a server side event. Any code that can be executed in the browseer console can be executed in the ClientCode node. A ClientCode node can also send a message back to the server using `node.send(...)` which becomes the server side output of the node.

The context in which the code is exected includes:

- `payload` which is the the `msg.payload` value
- `topic` which is the `msg.topic` value
- `msg.payload` contains the payload sent to the node.
- `node.id` and `nodeid` are the id of the current node

Functionality which interacts with the flow: 

- `node.send(payload)` where `payload` becomes the output the node on the server side
- `node.error("msg")` where msg is shown as a notification within the editor
- `node.status({fill: 'red', shape: 'dot', text: 'hello world'})` - generate a status for the node.

An example if the client code node is this [flow](https://flowhub.org/f/01920991a09b7e95) where the node generates an in browser notification.

## Deprecated Nodes

### ~~IsMobile~~

*Deprecated without replacement.*

Is a palette-only node meaning that it should not be included in any flows. It's single purpose is to remove the palette and sidebars on devices which have a screen width less that 890px. Node-RED has both bars open by default, that makes the mobile experience not so nice. This node is a simple hack that uses `onpaletteadd` callback to close both bars if the device is detected to have "small" width.

If this functionality is not desired, then disable this node in the palette manager.

### ~~Navigator~~

*Deprecated without replacement.*

~~Is a palette-only node meaning that it should not be included in any flows. What it does is to highlight nodes if they are referenced in the URL. This node will check the hash value of the URL and if it contains a node id, it will jump to the workspace and focus on the node in question. The node id should be given in the form of `/n/<node id>`, for example: [`.../#flow/878170e6f86c502b/n/b3baf3ca092064a9`](https://demo.openmindmap.org/omm/#flow/878170e6f86c502b/n/b3baf3ca092064a9). Any flow id that is given will be ignored and instead the flow of the node will be shown.~~

This functionality will be part of Node-RED 3.1.x upon release, so this node only makes sense for Node-RED 3.0.x versions.

This now also support `/n/<node id>/edit` which is also part of the 3.1.x release.

One final feature of this node is path highlighting, this is done by appeanding a `/p/<node1Id>,<node2Id>,<node3Id>,...` to the URL. Whether this will be natively supported in Node-RED is the author unclear.

This is a hack that uses the `onpaletteadd` callback to do its magic. If this functionality is not desired, then disable this node in the palette manager.

### ~~DrawSVG~~

*Deprecated with ClientCode replacement.*

A node for inserting an SVG image into the workspace. The image is layered above the grid but below nodes and their connections. The input message must contain SVG data (in string form) in the `payload` attribute.

**Update**: See this [flow](https://flowhub.org/f/141037dcda5b69fd) for doing this with a client code node (see below for explanation of ClientCode node.)


## Node-RED Versions

These nodes have been tested and found to work on Node-RED 3.0.2 and 3.1.0.beta.4.

## Examples

There are [example flows](/examples) contained in the package, examples can also be found online at [FlowHub.org](https://flowhub.org):

- [ClientCode](https://flowhub.org/f/e02ba6e534f7a0f4)
- [DrawSVG](https://flowhub.org/f/141037dcda5b69fd)
- [GetFlows](https://flowhub.org/f/0b1bfbf6e540be66)
- [Orphans](https://flowhub.org/f/2401c255b056e0e1)
- [Sink and Seeker](https://flowhub.org/f/139a816449acd89f)

## License

[*Do whatever but don't do evil* license](/LICENSE)

## Contribution & Ideas

Please here at GitHub via issues.

## Artifacts

- [NPMjs Package](https://www.npmjs.com/package/@gregoriusrippenstein/node-red-contrib-introspection)
- [GitHub Repository](https://github.com/gorenje/node-red-contrib-introspection)
- [Flow that maintains this package](https://flowhub.org/f/d73d76db3df96ba2)
- [Node-RED node package](https://flows.nodered.org/node/@gregoriusrippenstein/node-red-contrib-introspection)




