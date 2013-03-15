
define([
    'libs/load',
    'controllers/network',
    'controllers/node',
    'views/network',
    'views/node',
    'models'
], function (lib, networkController, nodeController, networkView, nodeView, models) {
    'use strict';

    var Ember = lib.Ember;
    var DS = lib.DS;

    var App = Ember.Application.create({});

    App.ApplicationRoute = Ember.Route.extend({
        setupController: function () {
            var rootNetwork = App.Network.createRecord({id: 1, nodes: [], edges: [], isIdle: true});
            this.controllerFor('network').set('model', rootNetwork);
        }

    });

    App.rootcontroller = null;
    App.ApplicationController = Ember.Controller.extend({
        shouldDisable: false,
        getAlgorithm: function () {
            return App.ReadAlgorithm();
        },

        startSimulations: function () {
            App.rootcontroller = this;
            this.controllerFor("network").startSimulations(this.getAlgorithm());
            this.set("shouldDisable", true);
        }
    });

    App.ButtonField = Ember.Button.extend({
        disabledBinding: "target.mainController.shouldDisable"
    });

    App.Store = DS.Store.extend({
        revision: 11,
        adapter: 'DS.FixtureAdapter'
    });

    App.NetworkView = networkView;
    App.NetworkController = networkController;
    App.Network = models.Network;

    App.NodeView = nodeView;
    App.NodeController = nodeController;
    App.Node = models.Node;

    App.Edge = models.Edge;
    App.Message = models.Message;

    // Debug
    var algorithm;
    App.ReadAlgorithm = function () {
        // make a synchronous jquery call to fetch algorithmlib.js
        var jqxhr = $.ajax({
            url: "js/algorithm",
            success: function (data) {
                algorithm = data;
            },
            async: false
        });
        return algorithm;
    };

    return App;
});