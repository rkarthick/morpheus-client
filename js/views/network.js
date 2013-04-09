
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


        createMessageBubble: function (point, message) {
            // TODO: check edge proximity
            // create the text
            var text = new paper.PointText(point);
            text.content = message;
            text.characterStyle = {
                fontSize: ENV.msg_fontsize,
                fillColor: ENV.msg_fgcolor,
            };
            text.bounds.center = new paper.Point(
                point.x,
                point.y - (ENV.shout_font_size / 4)
            );

            // create the bounding rectangle
            var br = new paper.Point({
                x: (text.bounds.bottomRight.x + 8),
                y: (text.bounds.bottomRight.y + 10)
            });
            var tl = new paper.Point({
                x: (text.bounds.topLeft.x - 8),
                y: (text.bounds.topLeft.y - 5)
            });
            var rectangle = new paper.Rectangle(tl, br);
            var roundedRectangle = new paper.Path.RoundRectangle(
                rectangle,
                new paper.Size(10, 10)
            );
            roundedRectangle.fillColor = ENV.msg_bgcolor;
            text.moveAbove(roundedRectangle);

            return new paper.Group([roundedRectangle, text]);
        },

        removeMessages: function () {
            var key;
            for (key in this.nodes) {
                if (this.nodes.hasOwnProperty(key)) {
                    var node = this.nodes[key];
                    node.removeMessage();
                }
            }
        },

        setMessagesVisibility: function (isVisible) {
            var key;
            for (key in this.nodes) {
                if (this.nodes.hasOwnProperty(key)) {
                    var node = this.nodes[key];
                    node.setMessageVisibility(isVisible);
                }
            }
            paper.view.draw();
        },

        deliverMessage: function (fromNodeId, toNodeId, message) {
            var fromNode = this.nodes[fromNodeId];
            var toNode = this.nodes[toNodeId];

            var source = fromNode.getCenter();
            var destination = toNode.getCenter();

            var messageCircle = paper.Path.Circle(source, 10);
            messageCircle.fillColor = ENV.message_color;
            messageCircle.opacity = 0.9;

            source.y = source.y - ENV.node_radius - 20;
            var messageBubble = this.createMessageBubble(
                source,
                message.get("contents")
            );
            var messageBubbleDestination = new paper.Point(
                destination.x,
                destination.y - ENV.node_radius - 20
            );
            messageBubble.visible = this.get("controller").areMessagesVisible();

            fromNode.moveAbove(messageCircle);
            toNode.moveAbove(messageCircle);

            fromNode.getEdges().forEach(function (edge) {
                messageCircle.moveAbove(edge);
            });

            var update = true;
            var networkObj = this;
            paper.view.onFrame = function (event) {
                if (update === true) {
                    var vector = destination.subtract(messageCircle.position);
                    // move it closer by 20 points
                    messageCircle.position = messageCircle.position.add(
                        vector.divide(20)
                    );

                    if (messageBubble !== null) {
                        var msgVector = messageBubbleDestination.subtract(
                            messageBubble.position
                        );
                        messageBubble.position = messageBubble.position.add(
                            msgVector.divide(20)
                        );
                    }
                    messageBubble.visible = networkObj.get("controller").areMessagesVisible();

                    // if the message has reached the destination
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
                    var messageBubbleForNode = null;
                    if (messageBubble !== null) {
                        // clone messagebubble before removing
                        messageBubbleForNode = messageBubble.clone();
                        messageBubble.remove();
                    }
                    messageCircle.remove();
                    toNode.messageCreated(message, messageBubbleForNode);
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
            delete this.nodes[nodeId];
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
                if (this.nodes.hasOwnProperty(key)) {
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

            // if (key.toUpperCase() === "C") {
            //     obj.createNewNode();
            // }
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
            roundsText.bounds.center = new paper.Point(
                ((banner.bounds.topLeft.x + banner.bounds.topRight.x) / 2),
                5
            );


            roundsText.moveAbove(banner);
            this.bannerContainer = new paper.Group([banner, roundsText]);
        },

        updateBannerText: function (content) {
            if (this.bannerContainer === null) {
                return;
            }
            if (this.bannerText === null) {
                this.bannerText = new paper.PointText(
                    this.bannerContainer.bounds.center
                );
                this.bannerText.moveAbove(this.bannerContainer);
            }
            this.bannerText.content = content;
            this.bannerText.characterStyle = {
                fontSize: ENV.banner_font_size,
                fillColor: ENV.banner_fgcolor
            };
            this.bannerText.bounds.center = new paper.Point(
                this.bannerContainer.bounds.center.x,
                this.bannerContainer.bounds.center.y - (ENV.banner_font_size / 4) + 5
            );
        },

        removeBanner: function () {
            this.bannerContainer.remove();
            this.bannerText.remove();
            this.bannerContainer = this.bannerText = null;
        },

        changeElementsLocation: function () {
            var i,
                key,
                sign;
            sign = -1;

            if (this.width === ENV.canvas_width_big) {
                sign = 1;
            }

            for (key in this.nodes) {
                if (this.nodes.hasOwnProperty(key)) {
                    var node = this.nodes[key];
                    var x = node.getCenter().x;
                    var y = node.getCenter().y;

                    x = x + (sign * (ENV.canvas_width_big - ENV.canvas_width_small) / 2);
                    y = y + (sign * (ENV.canvas_height_big - ENV.canvas_height_small) / 2);

                    node.moveTo(new paper.Point(x, y));
                }
            }
            paper.view.draw();

            if (this.bannerContainer !== null) {
                var container = this.bannerContainer.children[0];
                container.bounds.center = new paper.Point(
                    ENV.canvas_width - (ENV.banner_width / 2),
                    ENV.banner_height / 2
                );

                this.bannerContainer.children[1].bounds.center = new paper.Point(
                    ((container.bounds.topLeft.x + container.bounds.topRight.x) / 2),
                    5
                );
            }



            $('html, body').animate({scrollTop: (sign * ENV.canvas_height_big)}, '50');
        },

        changeLayout: function (layout) {
            this.set("height", ENV.layout[layout].height);
            this.set("width", ENV.layout[layout].width);

            $("#simulator").height(this.height);
            $("#simulator").width(this.width);

            var paperSize = new paper.Size(this.width, this.height);

            paper.view.viewSize = paperSize;
            this.changeElementsLocation();
        },


        didInsertElement: function () {
            var i;
            this._super();

            // paper.install(window);

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