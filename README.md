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

The SVG code can also be copied and pasted into something like [drawsvg.org](https://drawsvg.org/drawsvg.html) hence select-all-copy-paste is provide by having the editor window.

Improvements over [svgexport.io](https://svgexport.io) browser plugin:

- Respects the 'hide' CSS class that is used to hide specific elements, this the svgexport plugin cannot know.
- Compliments the setting of visibility on the 'g' element with opacity=0. The SVG Standard ignores visibility on 'g' elements but browsers don't seem to care, Inkscape does care.
- Image data (i.e. icons) is inlined using `data:image/XXXX;base64,` - this is good for things such as Inkscape that can't resolve relative urls. PNG, JPEG and SVG are supported.
- It also retrieves font details and includes them in the SVG. This makes the font italic, even if it's not the correct font family (because font might not be installed on system).

Disappointments:

- Font-awesome icons, because they use the font-awesome font, aren't inlined and therefore aren't available in external tools (but are visible if SVG opened in browser). If the font-awesome fonts are installed on the system icons do work in Inkscape.
- Because a double click is required, any highlights in the workflow are lost (i.e. link-in/out highlights showing the other tab names disappears)
- Limited testing: on Firefox (on mac), your mileage might vary
- No error checking - network requests are assumed to work

## Examples

There is a single example flow contained in the package. There are also examples to be found online: 

- [Orphans](https://demo.openmindmap.org/omm/#flow/3ebb65fdbecb182e) - node is top left of flow or search for `type:Orphans`
- [Seeker](https://demo.openmindmap.org/omm/#flow/40ea5f2aea6592ae) - top left and the [Sink](https://demo.openmindmap.org/omm/#flow/459c271a96458c7c) - top right
- [Screenshot](https://demo.openmindmap.org/omm/#flow/4e2d8c13066b705e) - top left

Example screenshot: 

![example screenshot](/assets/screenshot.svg)

## License

[Do whatever but don't do evil](/LICENSE)

## Contribution & Ideas

Please here at GitHub via issues.
