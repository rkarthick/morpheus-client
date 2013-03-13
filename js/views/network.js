
define([
    'env',
    'libs/load'
], function (e, lib) {
    'use strict';

    var get = lib.Ember.get,
        edgeCreationMode = false,
        nodeMovementMode = false,
        edgeThreshold = 20,
        selectedItem = null,
        tempEdge = null,
        editingMode = false,
        parentNode = null;


    return lib.Ember.View.extend({

        tagName: "canvas",
        attributeBindings: ['height', 'width'],
        height: ENV.canvas_height,
        width: ENV.canvas_width,
        nodes: {},

        getSource: function (event) {
            // var point = new paper.Point(event.clientX, event.clientY);
            return paper.project.hitTest(event.point, ENV.hitOptions);
        },

        addEdge: function (firstNodeId, secondNodeId) {
            var node1 = this.nodes[firstNodeId];
            var node2 = this.nodes[secondNodeId];

            var path = new paper.Path.Line(
                node1.getCenter(),
                node2.getCenter()
            );

            path.strokeColor = ENV.edge_color;
            path.strokeWidth = ENV.edge_stroke_width;

            node1.addEdge(path);
            node2.addEdge(path);

            return path;
        },

        addNode: function (node) {
            this.nodes[node.getNodeId()] = node;
        },

        createNewNode: function () {
            ENV.controller = this.get("controller");
            ENV.canvasEditingMode = true;

            // open the dialog
            $("#dialog-form").dialog("open");
        },

        removeNode: function (nodeId) {
            this.nodes[nodeId].remove();
            delete this.nodes[selectedItem.nodeId];
            paper.view.draw();
        },


        deleteSelectedItem: function () {
            if (!confirm('Are you sure you want to delete the selected item?')) {
                return;
            }
            // check if the selected item is a node
            if (selectedItem.nodeId !== undefined) {
                this.get("controller").removeNode(selectedItem.nodeId);
            } else {
                // remove the edge
                selectedItem.remove();
            }
            this.deSelectAll();
        },

        // commands C for create
        keyUp: function (event) {
            var key = event.key;
            // the context changes from network view to paper.tools for this
            // hence obj needs to be created
            var obj = this.networkObject;
            if (ENV.canvasEditingMode === true) {
                return;
            }

            if (key.toUpperCase() === "C") {
                obj.createNewNode();
            }
            if (key === ENV.DELETE || key === "backspace") {
                obj.deleteSelectedItem();
            }
        },

        getDistanceBetween: function (point1, point2) {
            var x = (point1.x - point2.x);
            var y = (point1.y - point2.y);

            return Math.floor(Math.sqrt((x * x) + (y * y)));
        },

        // check the distance of the point with any node nearby,
        // if it is closeby create the new edge
        getClosestNode: function (point) {
            var i;
            var nodeId = null;
            for (nodeId in this.nodes) {
                if (this.nodes[nodeId] !== parentNode) {
                    var d = this.getDistanceBetween(
                        point,
                        this.nodes[nodeId].getCenter()
                    );
                    if (d <= ENV.node_radius) {
                        return parseInt(nodeId, 10);
                    }
                }
            }
            return null;
        },

        setCursor: function (point, nodeId) {
            var d = this.getDistanceBetween(
                    point,
                    this.nodes[nodeId].getCenter()
                );
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

        updateEdgeLocation: function (point) {
            var nodeCenter = parentNode.getCenter();
            tempEdge.getSegments().forEach(function (segment) {
                var segmentPoint = segment.getPoint();
                if (segmentPoint.x !== nodeCenter.x &&
                        segmentPoint.y !== nodeCenter.y) {
                    segment.point = point;
                }
            });
        },

        createNewEdge: function (nodeId) {
            if (nodeId === parentNode.getNodeId()) {
                return;
            }

            this.get("controller").connectNodes(
                nodeId,
                parentNode.getNodeId()
            );
            tempEdge.remove();
            tempEdge = null;
            edgeCreationMode = false;
            parentNode = null;
        },


        mUp: function (event) {
            edgeCreationMode = false;
            if (tempEdge !== null) {
                tempEdge.remove();
            }
            tempEdge = null;
            nodeMovementMode = null;
            parentNode = null;
        },

        mMove: function (event) {
            var result = this.networkObject.getSource(event);
            if (result !== null) {
                var path = result.item;
                if (path.nodeId !== undefined) {
                    this.networkObject.setCursor(event.point, path.nodeId);
                    return;
                }
            }
            this.networkObject.edgeCreationMode = false;
            document.body.style.cursor = "default";
        },

        deSelectAll: function () {
            var items = paper.project.activeLayer.children,
                i;
            selectedItem = null;
            for (i = 0; i < items.length; i = i + 1) {
                items[i].selected = false;
            }
        },

        mDrag: function (event) {
            var obj = this.networkObject,
                result = obj.getSource(event),
                nodeId = null,
                path = null;

            // TODO: Refine
            if (edgeCreationMode === true && parentNode !== null && tempEdge !== null) {
                obj.updateEdgeLocation(event.point);
                if (result !== null) {
                    nodeId = obj.getClosestNode(event.point);
                    if (nodeId !== null) {
                        obj.createNewEdge(nodeId);
                    }
                }
            }

            if (result === null && nodeMovementMode === false) {
                return;
            }

            if (parentNode === null) {
                if(result === null) {
                    return;
                }
                path = result.item;
                if (path === null || path.nodeId === undefined) {
                    return;
                }
                parentNode = obj.nodes[path.nodeId];
            }

            if (edgeCreationMode === true) {
                if (tempEdge === null) {
                    tempEdge = new paper.Path.Line(parentNode.getCenter(), event.point);
                    tempEdge.strokeColor = "white";
                    tempEdge.strokeWidth = 8;
                    parentNode.moveAbove(tempEdge);
                    obj.deSelectAll();
                }
                obj.updateEdgeLocation(event.point);
            } else {
                nodeMovementMode = true;
                parentNode.moveTo(event.point);
            }
        },

        mDown: function (event) {
            var obj = this.networkObject,
                result = obj.getSource(event);

            if (result !== null) {
                var path = result.item;
                if (path.selected === true) {
                    obj.deSelectAll();
                } else {
                    obj.deSelectAll();
                    path.selected = true;
                    selectedItem = path;
                }
            } else {
                obj.deSelectAll();
            }
        },

        initEvents: function () {
            var tool = new paper.Tool();
            tool.activate();

            tool.networkObject = this;

            tool.onKeyUp = this.keyUp;
            tool.onMouseMove = this.mMove;
            tool.onMouseDrag = this.mDrag;
            tool.onMouseUp = this.mUp;
            tool.onMouseDown = this.mDown;
        },


        didInsertElement: function () {
            var i;
            this._super();

            ENV.canvas = get(this, "element");
            ENV.ctx = ENV.canvas.getContext('2d');
            paper.setup(ENV.canvas);

            ENV.canvas.style.backgroundColor = ENV.background_color;

            var paperSize = new paper.Size(ENV.canvas_width, ENV.canvas_height);
            paper.viewSize = paperSize;

            paper.size = paperSize;

            // setup drag event
            this.initEvents();
            paper.view.draw();

            this.get("controller").setView(this);
        }
    });
});