

define([
    'libs/load'
], function (lib) {
    "use strict";

    return lib.Ember.ObjectController.extend({

        content: [],
        network: null,
        nodeId: null,

        nodeCreated: function () {
            if (this.get("view") === null) {
                var nodeView = App.NodeView.create({ controller: this });
                this.set("view", nodeView);

                var networkView = this.network.get("view");
                networkView.addNode(nodeView);
            }
        }.observes('content'),

        init: function () {
            this._super();

            // set model for the controller
            var networkModel = this.network.get("model");
            var node = App.Node.createRecord({nodeId: this.nodeId,
                network: networkModel, edges: [], messageQ: []});
            networkModel.get("nodes").addObject(node);
            this.set("model", node);
        },

        remove: function () {
            var i;
            var edgesLength = this.content.get("edges").get("length");
            for (i = 0; i < edgesLength; i = i + 1) {
                var edge = this.content.get("edges").objectAt(0);
                edge.deleteRecord();
            }

            this.content.deleteRecord();
        }
    });
});
