define([
    'libs/load',
    'executor'
], function (lib, Executor) {

    'use strict';

    // Network controller that manages to network model
    return lib.Ember.ObjectController.extend({

        nodes: {},
        content: [],
        edgesCount: 0,
        deliveredMessages: {},
        view: null,
        executor: null,
        templateObject: null,
        pauseSimulationFlag: false,
        killSimulationFlag: false,
        showMessagesFlag: true,
        zoomLevel: ENV.large,

        areMessagesVisible: function () {
            return this.showMessagesFlag;
        },

        setMessagesVisible: function (isVisible) {
            this.showMessagesFlag = isVisible;
            this.get("view").setMessagesVisibility(isVisible);
        },

        clear: function () {
            var key = 0;
            for (key in this.nodes) {
                var node = this.nodes[key];
                this.removeNode(
                    key,
                    node.get("view").getEdges()
                );
            }
            this.nodes = {};
        },

        changeZoom: function () {
            if (this.zoomLevel === ENV.small) {
                ENV.node_radius = ENV.small_node_radius;
                ENV.node_font_size = ENV.small_node_font_size;
                ENV.edge_stroke_width = ENV.small_edge_stroke_width;
            } else {
                ENV.node_radius = ENV.large_node_radius;
                ENV.node_font_size = ENV.large_node_font_size;
                ENV.edge_stroke_width = ENV.large_edge_stroke_width;
            }

            this.get("view").changeZoom();
        },

        cancelSimulation: function () {
            this.set("killSimulationFlag", true);
            if (this.pauseSimulationFlag === true) {
                this.waitForView(100);
            }
        },

        pauseSimulation: function () {
            this.set("pauseSimulationFlag", true);
        },

        resumeSimulation: function () {
            if (this.pauseSimulationFlag === true) {
                this.set("pauseSimulationFlag", false);
                this.goToNextRound();
            }
        },

        goToNextRound: function () {
            this.get("view").removeMessages();
            this.executor.signalStartNewRound();
        },

        setView: function (view) {
            this.view = view;
        },

        startSimulations: function (algorithm) {
            this.executor = new Executor();
            this.executor.start(
                algorithm,
                this
            );
        },

        nodeShout: function (message, nodeId) {
            this.nodes[nodeId].get("view").shout(message);
        },

        setNodesColor: function (bgColor, fgColor) {
            var key;
            for (key in this.nodes) {
                var node = this.nodes[key];
                node.get("view").setColor(bgColor, fgColor);
            }
        },

        executorFailed: function (message) {
            this.cleanUpRounds();
            $("#error_dialog").html(message);
            $("#error_dialog").dialog("open");
        },

        setNodeColor: function (bgColor, fgColor, nodeId) {
            this.nodes[nodeId].get("view").setColor(bgColor, fgColor);
        },

        setupStartRounds: function () {
            this.setNodesColor(ENV.node_bgcolor_active, ENV.node_fgcolor_active);
            this.set("pauseSimulationFlag", false);
            this.set("killSimulationFlag", false);
            this.get("view").deSelectAll();
            this.get("view").changeMode(ENV.SIMULMODE);
            this.get("view").showBanner();
            this.get("view").updateBannerText(1);
        },

        cleanUpRounds: function () {
            this.get("view").removeMessages();
            this.setNodesColor(ENV.node_bgcolor, ENV.node_fgcolor);
            this.get("view").changeMode(ENV.EDITMODE);
            this.get("view").removeBanner();
            // TODO: try to get this gracefully

            App.rootcontroller.executionFinished();
        },

        isAnimationComplete: function () {
            var key = null;
            for (key in this.deliveredMessages) {
                if (this.deliveredMessages[key] === false) {
                    return false;
                }
            }
            return true;
        },

        waitForView: function (roundNumber) {
            var networkObj = this;

            var waitForAnimation = function () {
                if (networkObj.isAnimationComplete() !== true) {
                    setTimeout(waitForAnimation, 50);
                    return;
                } else {
                    if (networkObj.killSimulationFlag === true) {
                        networkObj.executor.cancelExecution();
                        networkObj.cleanUpRounds();
                        return;
                    }
                    if (networkObj.pauseSimulationFlag === false) {
                        networkObj.goToNextRound();
                    }
                    networkObj.get("view").updateBannerText(roundNumber + 1);
                }
            };
            waitForAnimation();
        },

        messageAnimationComplete: function (message) {
            this.deliveredMessages[message.get("id")] = true;
        },

        signalNodeDeath: function (nodeId) {
            this.nodes[nodeId].get("view").setColor(
                ENV.node_bgcolor_dead,
                ENV.node_fgcolor_dead
            );
            this.nodes[nodeId].get("view").removeMessage();
        },

        getAngleWrtXAxis: function (v1) {
            var v2 = {x: 1, y: 0},
                angleRad = Math.acos((v1.x * v2.x + v1.y * v2.y) /
                            (Math.sqrt(v1.x * v1.x + v1.y * v1.y) * Math.sqrt(v2.x * v2.x + v2.y * v2.y))),
                angleDeg = angleRad * 180 / Math.PI;

            return angleDeg;
        },

        getTemplateObject: function (nodeId) {
            if (this.templateObject !== null) {
                return this.templateObject[nodeId];
            }

            return null;
        },

        getNeighboursWithLocation: function (nodeId) {
            var neighbours = {},
                i = 0;
            neighbours.topLeft = [];
            neighbours.bottomLeft = [];
            neighbours.topRight = [];
            neighbours.bottomRight = [];

            var neighbourIds = this.nodes[nodeId].getNeighbours();
            var cPoint = this.nodes[nodeId].get("view").getCenter();

            for (i = 0; i < neighbourIds.length; i = i + 1) {
                var nId = neighbourIds[i];
                var nPoint = this.nodes[nId].get("view").getCenter();

                if (nPoint.x < cPoint.x && nPoint.y < cPoint.y) {
                    neighbours.topLeft.push(nId);
                }

                if (nPoint.x < cPoint.x && nPoint.y > cPoint.y) {
                    neighbours.bottomLeft.push(nId);
                }

                if (nPoint.x > cPoint.x && nPoint.y < cPoint.y) {
                    neighbours.topRight.push(nId);
                }

                if (nPoint.x > cPoint.x && nPoint.y > cPoint.y) {
                    neighbours.bottomRight.push(nId);
                }
            }

            return neighbours;
        },

        getSortedNeighbours: function (nodeId) {
            var graphNodes = {},
                i,
                angles = [],
                nidAngles = {},
                neighbours = [];

            var neighbourIds = this.nodes[nodeId].getNeighbours();
            var cPoint = this.nodes[nodeId].get("view").getCenter();

            // find in a ring with origin as nodeId's center,
            // where does the neighbor lie?
            for (i = 0; i < neighbourIds.length; i = i + 1) {
                var nId = neighbourIds[i];
                var nPoint = this.nodes[nId].get("view").getCenter();
                var rPoint = {};

                rPoint.x = nPoint.x - cPoint.x;
                rPoint.y = cPoint.y - nPoint.y;

                var angle = this.getAngleWrtXAxis(rPoint);
                var sub = 0;

                // 4th quadrant
                if (rPoint.x < 0 && rPoint.y >= 0) {
                    angle = -1 * (360 - angle);
                }
                // 3rd quadrant
                if (rPoint.x <= 0 && rPoint.y < 0) {
                    angle = -1 * (angle);
                }
                // 2nd Quadrant
                if (rPoint.x > 0 && rPoint.y <= 0) {
                    angle = 90 - angle;
                }
                // 1st Quardrant
                if (rPoint.x >= 0 && rPoint.y > 0) {
                    angle = angle + 90;
                }

                angles.push(angle);
                nidAngles[angle] = nId;
            }

            // descending order sort
            angles.sort(function (a, b) { return b - a; });

            for (i = 0; i < angles.length; i = i + 1) {
                neighbours[i] = nidAngles[angles[i]];
            }

            return neighbours;
        },

        messageDelivered: function (obj) {
            var controllerObj = obj;
            this.content.get("messageQ").forEach(function (message) {

                if (message.get("delivered") === true &&
                        !controllerObj.deliveredMessages.hasOwnProperty(message.get("id"))) {
                    controllerObj.get("view").deliverMessage(
                        message.get("fromNode").get("nodeId"),
                        message.get("toNode").get("nodeId"),
                        message
                    );
                    controllerObj.deliveredMessages[message.get("id")] = false;
                }
            });
        }.observes("content.messageQ.@each.delivered"),

        getEdgeByNodeIds: function (firstNodeId, secondNodeId) {
            var edges = this.content.get("edges"),
                i;
            for (i = 0; i < edges.get("length"); i = i + 1) {
                var edge = edges.objectAt(i);
                if (edge.get("firstEnd").get("nodeId") === firstNodeId &&
                        edge.get("secondEnd").get("nodeId") === secondNodeId) {
                    return edge;
                }

                if (edge.get("firstEnd").get("nodeId") === secondNodeId &&
                        edge.get("secondEnd").get("nodeId") === firstNodeId) {
                    return edge;
                }
            }
            return null;
        },

        // remove the edge from the model!
        removeEdge: function (firstNodeId, secondNodeId) {
            var edge = this.getEdgeByNodeIds(firstNodeId, secondNodeId);
            edge.deleteRecord();
        },

        createEdge: function () {
            var edgesLength = this.get("edges").get("length");
            if (edgesLength <= this.edgesCount) {
                this.edgesCount = this.edgesCount - 1;
                return;
            }

            // get the added edge
            var edgeModel = this.get("edges").objectAt(edgesLength - 1);

            // add edge to the view
            this.get("view").addEdge(
                edgeModel.get("firstEnd").get("nodeId"),
                edgeModel.get("secondEnd").get("nodeId")
            );

            this.edgesCount = edgesLength;

        }.observes("content.edges.@each.isLoaded"),

        connectNodes: function (firstNodeId, secondNodeId) {
            var edges = this.content.get("edges"),
                i = null;

            // check if there is already a edge
            if (this.getEdgeByNodeIds(firstNodeId, secondNodeId) !== null) {
                return;
            }

            // create the new edge
            var firstEnd  = this.nodes[firstNodeId].content;
            var secondEnd = this.nodes[secondNodeId].content;
            var edgeModel = App.Edge.createRecord({
                    network: this.get("model"),
                    firstEnd: firstEnd,
                    secondEnd: secondEnd
                });

            firstEnd.get("edges").addObject(edgeModel);
            secondEnd.get("edges").addObject(edgeModel);
            this.content.get("edges").addObject(edgeModel);
        },

        createNewNode: function (nodeId) {
            nodeId = parseInt(nodeId, 10);
            if (!this.nodes.hasOwnProperty(nodeId)) {
                this.nodes[nodeId] = App.NodeController.create({nodeId: nodeId, network: this});
                return this.nodes[nodeId];
            } else {
                return null;
            }
        },

        createNewNodeFromDialog: function () {
            this.get("view").createNewNode();
        },

        createRandomNewNode: function () {
            var node = this.createNewNode(Math.floor((Math.random() * 1000) + 1));
            while (node === null) {
                node = this.createNewNode(Math.floor((Math.random() * 1000) + 1));
            }
            return node;
        },

        changeLayout: function (layout) {
            ENV.canvas_width = ENV.layout[layout].width;
            ENV.canvas_height = ENV.layout[layout].height;

            this.get("view").changeLayout(layout);
        },

        removeNode: function (nodeId, edges) {
            var i;
            nodeId = parseInt(nodeId, 10);
            if (!this.nodes.hasOwnProperty(nodeId)) {
                throw "Node is deleted already.";
            }

            var neighbours = this.nodes[nodeId].getNeighbours();
            for (i = 0; i < neighbours.length; i = i + 1) {
                this.nodes[neighbours[i]].removeEdges(edges);
            }


            this.nodes[nodeId].remove();
            delete this.nodes[nodeId];

            // TODO: Move it to observable
            // remove from view
            this.get("view").removeNode(nodeId);
        }
    });
});