
define([
    'libs/load',
    'controllers/network',
    'controllers/node',
    'controllers/template',
    'controllers/editor',
    'controllers/algorithm',
    'views/network',
    'views/node',
    'views/editor',
    'views/template',
    'views/algorithm',
    'models',
    'templatemodel',
    'algorithmmodel'
], function (lib, networkController, nodeController, templateController, editorController, algorithmController, networkView, nodeView, editorView, templateView, algorithmView, models, templateModel, algorithmModel) {
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
        currentlyRunning: false,
        currentLayout: ENV.layout_small,
        getAlgorithm: function () {
            return App.ReadAlgorithm();
        },

        init: function () {
            App.rootcontroller = this;
        },

        render: function (templateName) {
            this.controllerFor('template').render(templateName);
        },

        readAlg: function (algorithmName) {
            this.controllerFor('algorithm').render(algorithmName);
        },

        stopSimulation: function () {
            if (this.currentlyRunning === false) {
                this.controllerFor("network").cleanUpRounds();
                return;
            }
            this.controllerFor("network").cancelSimulation();

            this.executionFinished();
        },

        hideMessages: function () {
            if (this.controllerFor("network").areMessagesVisible() === true) {
                this.controllerFor("network").setMessagesVisible(false);
                $(".hidemessages").addClass("showmessages");
                $(".showmessages").removeClass("hidemessages");
            } else {
                this.controllerFor("network").setMessagesVisible(true);
                $(".showmessages").addClass("hidemessages");
                $(".hidemessages").removeClass("showmessages");
            }
        },

        executionFinished: function () {
            this.set("currentlyRunning", false);
            $(".addnode").removeClass("disabled");

            $(".startsimulation").removeClass("disabled");
            $(".pausesimulation").addClass("disabled");
            $(".gonextstep").addClass("disabled");
            $(".stopsimulation").addClass("disabled");
            $(".hidemessages").addClass("disabled");
            $(".showmessages").addClass("disabled");
        },

        pauseSimulation: function () {
            if (this.currentlyRunning === false) {
                return;
            }

            this.controllerFor("network").pauseSimulation();
            $(".pausesimulation").addClass("disabled");
            $(".startsimulation").removeClass("disabled");
            $(".gonextstep").removeClass("disabled");
        },

        resumeSimulation: function () {
            this.controllerFor("network").resumeSimulation();

            $(".startsimulation").addClass("disabled");
            $(".pausesimulation").removeClass("disabled");
            $(".gonextstep").addClass("disabled");
            $(".stopsimulation").removeClass("disabled");
        },

        goNextStep: function () {
            this.controllerFor("network").goToNextRound();
        },

        startSimulations: function () {
            if (this.currentlyRunning === true) {
                this.resumeSimulation();
                return;
            }

            App.rootcontroller = this;

            this.controllerFor("network").startSimulations(
                this.controllerFor("editor").getAlgorithm()
            );
            this.set("currentlyRunning", true);
            $(".addnode").addClass("disabled");

            $(".startsimulation").addClass("disabled");
            $(".pausesimulation").removeClass("disabled");
            $(".gonextstep").addClass("disabled");
            $(".stopsimulation").removeClass("disabled");
            $(".hidemessages").removeClass("disabled");
        },

        changeLayout: function () {
            if (this.currentLayout === ENV.layout_small) {
                this.currentLayout = ENV.layout_big;
                $(".expandlayout").addClass("shrinklayout");
                $(".expandlayout").removeClass("expandlayout");
            } else {
                this.currentLayout = ENV.layout_small;
                $(".shrinklayout").addClass("expandlayout");
                $(".expandlayout").removeClass("shrinklayout");
            }

            this.controllerFor("network").changeLayout(this.currentLayout);
            this.controllerFor("editor").changeLayout(this.currentLayout);
        },

        loadAlgorithm: function (algorithm) {
            this.controllerFor("editor").setAlgorithm(algorithm);
        },

        addNode: function () {
            if (this.currentlyRunning === true) {
                return;
            }
            this.controllerFor("network").createNewNodeFromDialog();
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

    App.EditorController = editorController;
    App.EditorView = editorView;

    App.TemplateView = templateView;
    App.TemplateController = templateController;

    App.TemplateModel = templateModel;

    App.AlgorithmView = algorithmView;
    App.AlgorithmController = algorithmController;

    App.AlgorithmModel = algorithmModel;

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


// Ember.Select
//     contentBinding="App.NodeTemplates.content"
//     valueBinding="App.NodeTemplates.value"