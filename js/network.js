

var Network = function () {

    "use strict";

    var DELETE = 46,
        BACKSPACE = 8,
        canvas_width = 700,
        canvas_height = 700,
        circle_radius = 20,
        edgeCreationMode = false,
        nodeMovementMode = false,
        edgeThreshold = 18,
        background_color = "#3d3d3d",
        canvas = null,
        ctx = null,
        nodes = {},
        selectedItem = null,
        tempEdge = null,
        parentNode = null,
        hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 10
        },

        getDistanceBetween = function (point1, point2) {
            var x = (point1.x - point2.x);
            var y = (point1.y - point2.y);

            return Math.floor(Math.sqrt((x * x) + (y * y)));
        },

        deSelectAll = function () {
            var items = paper.project.activeLayer.children,
                i;
            selectedItem = null;
            for (i = 0; i < items.length; i = i + 1) {
                items[i].selected = false;
            }
        },

        createNewNode = function () {
            var breakLoop = false;
            while (!breakLoop) {
                breakLoop = true;
                var nodeId = prompt("Please enter the NodeId");
                if (nodes.hasOwnProperty(nodeId)) {
                    alert("Node Id exists. Please enter a new one.");
                    breakLoop = false;
                }
                if (isNaN(nodeId)) {
                    alert("Node Id needs to be a number");
                    breakLoop = false;
                }
            }

            if (nodeId === null) {
                return;
            }

            nodes[nodeId] = new Node(350, 200, nodeId);
        },

        getNodeByNodeId = function (id) {
            return nodes[id];
        },


        getSource = function (event) {
            return paper.project.hitTest(event.point, hitOptions);
        },

        setCursor = function (point, nodeId) {
            var d = getDistanceBetween(point, nodes[nodeId].getCenter());
            if (d > edgeThreshold) {
                edgeCreationMode = true;
                document.body.style.cursor = "crosshair";
            } else {
                if (tempEdge === null) {
                    edgeCreationMode = false;
                    document.body.style.cursor = "move";
                }

            }
        },

        mouseMove = function (event) {
            var result = getSource(event);
            if (result !== null) {
                var path = result.item;
                if (path.nodeId !== undefined) {
                    setCursor(event.point, path.nodeId);
                    return;
                }
            }
            edgeCreationMode = false;
            document.body.style.cursor = "default";
        },

        updateEdgeLocation = function (point) {
            var nodeCenter = parentNode.getCenter();
            tempEdge.getSegments().forEach(function (segment) {
                var segmentPoint = segment.getPoint();
                if (segmentPoint.x !== nodeCenter.x &&
                        segmentPoint.y !== nodeCenter.y) {
                    segment.point = point;
                }
            });
        },

        mouseUp = function (event) {
            edgeCreationMode = false;
            if (tempEdge !== null) {
                tempEdge.remove();
            }
            tempEdge = null;
            nodeMovementMode = null;
            parentNode = null;
        },

        createNewEdge = function (nodeId) {
            if (nodeId === parentNode.getNodeId()) {
                return;
            }
            Node.connectNodes(nodes[nodeId], parentNode);
            tempEdge.remove();
            tempEdge = null;
            edgeCreationMode = false;
            parentNode = false;
        },

        // check the distance of the point with any node nearby,
        // if it is closeby create the new edge
        getClosestNode = function (point) {
            var i;

            for (var nodeId in nodes) {
                if (nodeId === parentNode.getNodeId()) {
                    continue;
                }
                var node = nodes[nodeId];
                var d = getDistanceBetween(point, node.getCenter());

                if(d <= circle_radius) {
                    return nodeId;
                }
            }
            return null;
        },

        mouseDrag = function (event) {
            var result = getSource(event),
                nodeId = null,
                path = null;

            // TODO: Refine
            if (edgeCreationMode === true && parentNode !== null && tempEdge !== null) {
                updateEdgeLocation(event.point);
                if (result !== null) {
                    nodeId = getClosestNode(event.point);
                    if (nodeId !== null) {
                        createNewEdge(nodeId);
                    }
                }
            }

            if (result === null && nodeMovementMode === false) {
                return;
            }

            if(parentNode === null) {
                path = result.item;
                if (path.nodeId === undefined) {
                    return;
                }
                parentNode = getNodeByNodeId(path.nodeId);
            }

            if (edgeCreationMode === true) {
                if (tempEdge === null) {
                    tempEdge = new paper.Path.Line(parentNode.getCenter(), event.point);
                    tempEdge.strokeColor = "white";
                    tempEdge.strokeWidth = 8;
                    parentNode.moveAbove(tempEdge);
                    deSelectAll();
                }
                updateEdgeLocation(event.point);
            } else {
                nodeMovementMode = true;
                parentNode.moveTo(event.point);
            }
        },

        mouseDown = function (event) {
            var result = getSource(event);
            if (result !== null) {
                var path = result.item;
                if (path.selected === true) {
                    deSelectAll();
                } else {
                    deSelectAll();
                    path.selected = true;
                    selectedItem = path;
                }
            } else {
                deSelectAll();
            }
        },

        deleteSelectedItem = function () {
            if (!confirm('Are you sure you want to delete the item?')) {
                return;
            }
            if (selectedItem.nodeId !== undefined) {
                nodes[selectedItem.nodeId].remove();
                delete nodes[selectedItem.nodeId];
            } else {
                selectedItem.remove();
            }
            deSelectAll();
        },

        keyDown = function (event) {
            // commands
            var key = event.key;
            if (key.toUpperCase() === "C") {
                createNewNode();
            }
            if (key === DELETE || key === "backspace") {
                deleteSelectedItem();
            }
        },

        initEvents = function () {
            var tool = new paper.Tool();
            tool.activate();

            tool.onMouseMove = mouseMove;
            tool.onMouseDown = mouseDown;
            tool.onMouseDrag = mouseDrag;
            tool.onMouseUp = mouseUp;
            tool.onKeyDown = keyDown;
        },

        initCanvas = function () {
            canvas = document.getElementById("network_container");
            ctx = canvas.getContext('2d');

            paper.setup(canvas);

            canvas.width = canvas_width;
            canvas.height = canvas_height;
            canvas.style.backgroundColor = background_color;

            var paperSize = new paper.Size(canvas_width, canvas_height);
            paper.viewSize = paperSize;

            paper.size = paperSize;
        };

    this.init = function () {

        var node_configuration = [[350, 100], [200, 250], [500, 250], [350, 400]];
        var i;

        initCanvas();
        initEvents();
        Node.ctx = ctx;

        var random = [];
        for (i = 0; i < node_configuration.length; i = i + 1) {
            var rand = Math.floor(Math.random() * 100);
            nodes[rand.toString()] = new Node(node_configuration[i][0],
                            node_configuration[i][1], rand.toString());
            random.push(rand.toString());
        }

        Node.connectNodes(nodes[random[0]], nodes[random[1]]);
        Node.connectNodes(nodes[random[0]], nodes[random[3]]);
        Node.connectNodes(nodes[random[0]], nodes[random[2]]);

        // moveNode
        paper.view.draw();

    };

    // paper.onMouseDown = function (event) {
    //     alert("test");
    // };


};