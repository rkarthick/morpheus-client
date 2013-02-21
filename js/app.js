
(function (win) {

    'use strict';
    // Global app
    win.App = Ember.Application.create();

    WorkerGlobals.App = win.App

    var NODES_LIMIT = 1000;

    // Router Map
    App.Router.map(function() {
      this.resource('networks');
    });

    // Routes
    App.NetworksRoute = Ember.Route.extend({
        model: function () {
            return App.Network.find();
        }
    });

    // Network controller that manages to network model
    App.NetworkController = Ember.ObjectController.extend({
        addNode: function (node) {
            var network = this.get('model'),
                nodes = network.get('nodes');
            if (nodes.length > NODES_LIMIT) {
                throw new Error("addNode(): Total number of nodes exceeded");
            }
            node.network = network;
            nodes.pushObject(node);
        },
        addEdge: function (edge) {
            var network = this.get('model'),
                edges = network.get('edges');
            edge.network = network;
            edges.pushObject(edge);
        },
        setAlgorithm: function (algorithm) {
            var network = this.get('model');
            network.algorithm = algorithm;
        }
    });


    // Models
    App.Store = DS.Store.extend({
        revision: 11,
        adapter: 'DS.FixtureAdapter'
    });

    // the algorithm is kept global at the network level
    // coz of the assumption that all peers will execute the same algorithm
    App.Network = DS.Model.extend({
        nodes: DS.hasMany('App.Node'),
        edges: DS.hasMany('App.Edge'),
        rounds: DS.attr('number'),
        isIdle: DS.attr('boolean'),
        algorithm: DS.attr('string')
    });

    // One to many relationship between edges and node
    App.Node = DS.Model.extend({
        network: DS.belongsTo('App.Network'),
        edges: DS.hasMany('App.Edge'),
        messageQ: DS.hasMany('App.Messages')
    });

    App.Edge = DS.Model.extend({
        network: DS.belongsTo('App.Network'),
        firstEnd: DS.belongsTo('App.Node'),
        secondEnd: DS.belongsTo('App.Node')
        // todo: direction?
    });

    App.Message = DS.Model.extend({
        network: DS.belongsTo('App.Network'),
        fromNode: DS.belongsTo('App.Node'),
        toNode: DS.belongsTo('App.Node'),
        delivered: DS.attr('boolean'),
        data: DS.attr('string') // change it to JSON?
    });

    // Load temporary data
    App.Network.FIXTURES = [{
        id: 1,
        nodes: [1, 2, 3, 4],
        edges: [1, 2, 3, 4]
    }];

    App.Node.FIXTURES = [{
        id: 1,
        network: 1,
        edges: [1, 4],
        messageQ: []
    }, {
        id: 2,
        network: 1,
        edges: [1, 2],
        messageQ: []
    }, {
        id: 3,
        network: 1,
        edges: [2, 3],
        messageQ: []
    }, {
        id: 4,
        network: 1,
        edges: [3, 4],
        messageQ: []
    }];


    App.Edge.FIXTURES = [{
        id: 1,
        network: 1,
        firstEnd: 1,
        secondEnd: 2
    }, {
        id: 1,
        network: 1,
        firstEnd: 2,
        secondEnd: 3
    }, {
        id: 1,
        network: 1,
        firstEnd: 3,
        secondEnd: 4
    }, {
        id: 1,
        network: 1,
        firstEnd: 4,
        secondEnd: 1
    }];

}(window));
