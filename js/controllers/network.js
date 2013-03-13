

define([
    'libs/load'
], function (lib) {

    'use strict';

    // Network controller that manages to network model
    return lib.Ember.ObjectController.extend({

        nodes: {},
        content: [],
        edgesCount: 0,

        view: null,

        setView: function (view) {
            this.view = view;
        },

        // TODO: Implement Delete node, edges
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

            // check if the edge already exists
            for (i = 0; i < edges.get("length"); i = i + 1) {
                var edge = edges.objectAt(i);
                if (edge.get("firstEnd").get("nodeId") === firstNodeId &&
                        edge.get("secondEnd").get("nodeId") === secondNodeId) {
                    return;
                }

                if (edge.get("firstEnd").get("nodeId") === secondNodeId &&
                        edge.get("secondEnd").get("nodeId") === firstNodeId) {
                    return;
                }
            }

            // create the new edge
            var firstEnd = this.nodes[firstNodeId].content;
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
            } else {
                alert("Node with id: " + nodeId + " already exists.");
            }
        },

        removeNode: function (nodeId) {
            nodeId = parseInt(nodeId, 10);
            if (!this.nodes.hasOwnProperty(nodeId)) {
                throw "Node is deleted already.";
            }

            this.nodes[nodeId].remove();
            delete this.nodes[nodeId];
            // TODO: Move it to observable
            // remove from view

            this.get("view").removeNode(nodeId);
        }


    });
});