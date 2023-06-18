# Node-RED Introspection Nodes

This is a collection of editor-only Node-RED nodes. Editor-only since they do not have any affect nor application on the server side, these nodes solely work within the editor, that is, the browser environment.

## Why?

The Node-RED editor is a powerful beast with many abilities, why not use them? Why not make use of those possibilities and create a set of introspection nodes, a form of visual linting before deployment. The editor already does syntax checking before deployment, why limit it to just that?

I found myself working on various flows and found some particular artistic but I wanted to scale them to poster size, hence I needed an SVG dump. Having not found what I was looking for, I created my own Screenshot node.

Orphans node many or many not have their reasons, sometimes nodes aren't meant to be there and can actually be deleted. Either way, nodes that have no connections, either in nor out, *might* no longer be needed. For me, orphan nodes represent commented-out code or code that can't be reached, so they potentially represent nostalgia, a nostalgia for coding ideas that are no longer valid.

Sometimes I found myself having extremely complex flows, flows that went over multiple tabs via the link-in/out nodes. I was lost as to how specific nodes were ever reached. The birth of the Sink & Seeker nodes was inevitable.

## Nodes

All nodes are editor-only which means that are triggered by double clicking on them (once they have been dragged into a flow) to open the tray. The tray then shows the fulfilment of their purpose.

There is no need nor requirement to deploy these nodes. Which implies that they also work in read-only mode of Node-RED. Since these nodes only provide information and make no changes, this should not be an issue.

### Orphans

Drag the Orphan node into a flow, double click and all nodes that have no connections are shown in the tray. Click on a node to highlight its location in the flow.

The nodes shown are across all flows and tabs, there is no need to have a Orphans node per flow.

### Sink & Seeker

Place the sink node at the end of a any flow, the point that needs to be reached. Place the seeker at the starting point. Double click on the seeker to open the tray and all possible paths (if there are any) between it and the sink are shown.

Double click on the top-level node and all nodes in the pathway are highlighted. Opening the top-level node shows all nodes along the path. Clicking on a node will highlight that node in flow.

### Screenshot

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

Since version 0.0.5 the Screenshot node takes one input. That input will trigger the node to take a screenshot *without double clicking to open the tray*. The intention is to have an inject trigger regularly so that screenshots are made automagically and flows can have highlights. Screenshots are then posted to the endpoint `/screenshot` (this can be captured with a http-in node) and data is post as a json object `{ d: <svgdata> }`.

There is an example [flow](/examples/trigger-and-save-screenshot.json) that demonstrates this feature. The author is aware that this is dangerously close to enabling spyware for flow modification, please see the [LICENSE](/LICENSE) and behaviour.

### IsMobile

Is a palette-only node meaning that it should not be included in any flows. It's single purpose is to remove the palette and sidebars on devices which have a screen width less that 890px. Node-RED has both bars open by default, that makes the mobile experience not so nice. This node is a simple hack that uses `onpaletteadd` callback to close both bars if the device is detected to have "small" width.

If this functionality is not desired, then disable this node in the palette manager.

### Navigator

Is a palette-only node meaning that it should not be included in any flows. What it does is to highlight nodes if they are referenced in the URL. This node will check the hash value of the URL and if it contains a node id, it will jump to the workspace and focus on the node in question. The node id should be given in the form of `/n/<node id>`, for example: [`.../#flow/878170e6f86c502b/n/b3baf3ca092064a9`](https://demo.openmindmap.org/omm/#flow/878170e6f86c502b/n/b3baf3ca092064a9). Any flow id that is given will be ignored and instead the flow of the node will be shown.

This is a hack that uses the `onpaletteadd` callback to do its magic. If this functionality is not desired, then disable this node in the palette manager.

### DrawSVG

A node for inserting an SVG image into the workspace. The image is layered above the grid but below nodes and their connections. The input message must contain SVG data (in string form) in the `payload` attribute.

### GetFlows -- Experimental

Node retrieves the current `flows.json` from the server but using the [Node-RED API](https://nodered.org/docs/api/admin/methods/get/flows/) so that it is storage independent. It returns the flows as a `payload` of the message.

The intention that this is triggered on a regular basis to backup the flows to a third party storage system. Recommended is usage in combination with the [zip](https://flows.nodered.org/node/node-red-contrib-zip) module to make the backups smaller.

GetFlows supports version selection of the flows and it has limited authentication using password `grant_type`.

Inspired by the [dsm](https://flows.nodered.org/node/node-red-contrib-dsm) package that has a [backup](https://github.com/cflurin/node-red-contrib-dsm/wiki/Backup) state machine.

## Examples

There are [example flows](/examples) contained in the package, examples can also be found online:

- [Orphans](https://demo.openmindmap.org/omm/#flow/3ebb65fdbecb182e/n/2be3f8794979d47b) - node is top left of flow or search for `type:Orphans`
- [Seeker](https://demo.openmindmap.org/omm/#flow/40ea5f2aea6592ae/n/b5f189a78d829197) - top left and the [Sink](https://demo.openmindmap.org/omm/#flow/459c271a96458c7c/n/e3262d9d2791ab78) - top right
- [Screenshot](https://demo.openmindmap.org/omm/#flow/4e2d8c13066b705e/n/499b1383580831aa) - top left
- [DrawSVG](https://demo.openmindmap.org/omm/#flow/6c8ce462533a1da4/n/248f2edd3d8acd96)

Example screenshot:

![example screenshot](/assets/screenshot.svg)

## License

[*Do whatever but don't do evil* license](/LICENSE)

## Contribution & Ideas

Please here at GitHub via issues.
