
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
        currentMode: ENV.EDITMODE,
        nodes: {},
        bannerText: null,
        bannerContainer: null,

        getSource: function (event) {
            // var point = new paper.Point(event.clientX, event.clientY);
            return paper.project.hitTest(event.point, ENV.hitOptions);
        },

        deliverMessage: function (fromNodeId, toNodeId, message) {
            var fromNode = this.nodes[fromNodeId];
            var toNode = this.nodes[toNodeId];

            var source = fromNode.getCenter();
            var destination = toNode.getCenter();

            var messageCircle = paper.Path.Circle(source, 10);
            messageCircle.fillColor = ENV.message_color;
            messageCircle.opacity = 0.9;

            fromNode.moveAbove(messageCircle);
            toNode.moveAbove(messageCircle);

            fromNode.getEdges().forEach(function (edge) {
                messageCircle.moveAbove(edge);
            });

            var update = true;
            paper.view.onFrame = function (event) {
                if (update === true) {
                    var vector = destination.subtract(messageCircle.position);
                    messageCircle.position = messageCircle.position.add(
                        vector.divide(20)
                    );
                    if (Math.abs(vector.x) <= (ENV.node_radius / 2) &&
                             Math.abs(vector.y) <= (ENV.node_radius / 2)) {
                        update = false;
                    }
                }
            };

            var controller = this.get("controller");
            // wait till the animation finishes
            var waitForUpdate = function () {
                if (update === true) {
                    setTimeout(waitForUpdate, 50);
                    return;
                } else {
                    messageCircle.remove();
                    toNode.messageCreated(message);
                }
            };
            waitForUpdate();
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

        changeMode: function (mode) {
            // check if the mode needs to simul mode
            // where all the events are deactivated
            this.currentMode = mode;
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

        removeSelectedEdge: function () {
            var i = 0,
                j = 0,
                points = [],
                edgeNodes = [],
                key,
                firstNode,
                secondNode;

            selectedItem.getSegments().forEach(function (segment) {
                points[i] = segment.getPoint();
                i = i + 1;
            });

            for (key in this.nodes) {
                var node = this.nodes[key];
                if ((node.getCenter().x === points[0].x &&
                        node.getCenter().y === points[0].y) ||
                        (node.getCenter().x === points[1].x &&
                        node.getCenter().y === points[1].y)) {
                    edgeNodes[j] = parseInt(key, 10);
                    j = j + 1;
                }
                // remove edge from node view
                node.removeEdge(selectedItem);
            }


            this.get("controller").removeEdge(edgeNodes[0], edgeNodes[1]);
        },

        deleteSelectedItem: function () {
            if (!confirm('Are you sure you want to delete the selected item?')) {
                return;
            }
            // check if the selected item is a node
            if (selectedItem.nodeId !== undefined) {
                this.get("controller").removeNode(
                    selectedItem.nodeId,
                    this.nodes[selectedItem.nodeId].getEdges()
                );
            } else {
                // remove the edge
                this.removeSelectedEdge();
                selectedItem.remove();
            }
            this.deSelectAll();
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

        deSelectAll: function () {
            var items = paper.project.activeLayer.children,
                i;
            selectedItem = null;
            for (i = 0; i < items.length; i = i + 1) {
                items[i].selected = false;
            }
        },

        /** Events **/
        keyUp: function (event) {
            var obj = this.networkObject;
            if (obj.currentMode === ENV.SIMULMODE) {
                return false;
            }

            var key = event.key;
            // the context changes from network view to paper.tools for this
            // hence obj needs to be created
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

        mUp: function (event) {
            var obj = this.networkObject;
            if (obj.currentMode === ENV.SIMULMODE) {
                return false;
            }

            edgeCreationMode = false;
            if (tempEdge !== null) {
                tempEdge.remove();
            }
            tempEdge = null;
            nodeMovementMode = null;
            parentNode = null;
        },

        mMove: function (event) {
            var obj = this.networkObject;
            if (obj.currentMode === ENV.SIMULMODE) {
                return false;
            }

            var result = obj.getSource(event);
            if (result !== null) {
                var path = result.item;
                if (path.nodeId !== undefined) {
                    obj.setCursor(event.point, path.nodeId);
                    return;
                }
            }
            obj.edgeCreationMode = false;

            document.body.style.cursor = "default";
        },

        mDrag: function (event) {
            var obj = this.networkObject;
            if (obj.currentMode === ENV.SIMULMODE) {
                return false;
            }

            var result = obj.getSource(event),
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
                if (result === null) {
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
                    tempEdge.strokeColor = ENV.edge_color_current;
                    tempEdge.strokeWidth = ENV.edge_stroke_width_current;
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
            var obj = this.networkObject;
            if (obj.currentMode === ENV.SIMULMODE) {
                return false;
            }

            var result = obj.getSource(event);
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

        /** end of events **/

        showBanner: function () {
            var banner = new paper.Path.Rectangle(
                new paper.Point(ENV.canvas_width - ENV.banner_width, 0),
                new paper.Point(ENV.canvas_width, ENV.banner_height)
            );
            banner.fillColor = ENV.banner_bgcolor;

            var roundsText = new paper.PointText(
                ((banner.bounds.topLeft.x + banner.bounds.topRight.x) / 2),
                5
            );

            roundsText.content = "Rounds";
            roundsText.characterStyle = {
                fontSize: 10,
                fillColor: "white"
            };
            roundsText.bounds.center = new Point(
                ((banner.bounds.topLeft.x + banner.bounds.topRight.x) / 2),
                5
            )


            roundsText.moveAbove(banner);
            this.bannerContainer = new paper.Group([banner, roundsText]);
        },

        updateBannerText: function (content) {
            if (this.bannerText === null) {
                this.bannerText = new paper.PointText(this.bannerContainer.bounds.center);
                this.bannerText.moveAbove(this.bannerContainer);
            }
            this.bannerText.content = content;
            this.bannerText.characterStyle = {
                fontSize: ENV.banner_font_size,
                fillColor: ENV.banner_fgcolor
            };
            this.bannerText.bounds.center = new paper.Point(
                this.bannerContainer.bounds.center.x,
                this.bannerContainer.bounds.center.y - (ENV.banner_font_size / 4)
            );
        },

        removeBanner: function () {
            this.bannerContainer.remove();
            this.bannerText.remove();
            this.bannerContainer = this.bannerText = null;
        },


        didInsertElement: function () {
            var i;
            this._super();

            paper.install(window);

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

            // Testing
            var n1 = this.get("controller").createNewNode(10);
            var n2 = this.get("controller").createNewNode(20);
            var n3 = this.get("controller").createNewNode(30);
            var n4 = this.get("controller").createNewNode(40);
            // var n5 = this.get("controller").createNewNode(50);
            // var n6 = this.get("controller").createNewNode(60);
            // var n7 = this.get("controller").createNewNode(70);
            // var n8 = this.get("controller").createNewNode(80);
            // var n9 = this.get("controller").createNewNode(90);

            n1.get("view").moveTo(new paper.Point(200, 100));
            n2.get("view").moveTo(new paper.Point(439, 100));
            n3.get("view").moveTo(new paper.Point(450, 400));
            n4.get("view").moveTo(new paper.Point(200, 400));

            // n5.get("view").moveTo(new paper.Point(300, 500));

            // n6.get("view").moveTo(new paper.Point(150, 300));
            // n7.get("view").moveTo(new paper.Point(100, 200));

            // n8.get("view").moveTo(new paper.Point(150, 100));
            // n9.get("view").moveTo(new paper.Point(300, 50));


            this.get("controller").connectNodes(10, 20);
            this.get("controller").connectNodes(20, 30);
            this.get("controller").connectNodes(30, 40);
            this.get("controller").connectNodes(40, 10);
            // this.get("controller").connectNodes(10, 60);
            // this.get("controller").connectNodes(10, 70);
            // this.get("controller").connectNodes(10, 80);
            // this.get("controller").connectNodes(10, 90);
            // this.showBanner();
            paper.view.draw();


            // console.log(this.get("controller").getSortedNeighbours(10));

            // // create message
            // var m = App.Message.createRecord({
            //         network: this.get("controller").get("model"),
            //         fromNode: n1.get("model"),
            //         toNode: n2.get("model"),
            //         delivered: false,
            //         contents: "i=10"
            //     });

            // this.get("controller").content.get("messageQ").addObject(m);
            // m.set("delivered", true);

            // m = App.Message.createRecord({
            //     network: this.get("controller").get("model"),
            //     fromNode: n2.get("model"),
            //     toNode: n1.get("model"),
            //     delivered: false,
            //     contents: "i=11"
            // });
            // this.get("controller").content.get("messageQ").addObject(m);
            // m.set("delivered", true);

        }
    });
});