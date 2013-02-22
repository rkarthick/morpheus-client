// var n3 = App.Node.createRecord({nodeId: 10, network: network, edges: [], messageQ: []});
// var n4 = App.Node.createRecord({nodeId: 11, network: network, edges: [], messageQ: []});
// var e1 = App.Edge.createRecord({network: network, firstEnd: n3, secondEnd: n4});
// debugger;
// var m1 = App.Message.createRecord({network: network, fromNode: null, toNode: null, delivered: null, contents: ""});
// n3.get("edges").addObject(e1);
// n4.get("edges").addObject(e1);
// // var m = App.Message.createRecord();
// var nodes = network.get("nodes");
// nodes.forEach(function (node) {
//     console.log("Nodes: " + node.get("nodeId"));
//     node.get("edges").forEach(function (edge) {
//         console.log("  Edge: " + edge.get("id"));
//     });
// });


(function () {
    'use strict';

    // Global app
    window.App = Ember.Application.create();

    var NODES_LIMIT = 1000;

    // Router Map
    App.Router.map(function () {
        this.resource('networks');
    });

    App.IndexRoute = Ember.Route.extend({
        redirect: function() {
            this.transitionTo('networks');
        }
    });

    // Routes
    App.NetworksRoute = Ember.Route.extend({
        model: function () {
            return App.Network.find();
        }
    });

    App.MessageRoute = Ember.Route.extend({
        model: function () {
            return App.Message.find();
        }
    });

    App.NetworksController = Ember.ArrayController.extend({
        startSimulations: function (network) {
            var e = new Executor();
            var alg = "log(getId()); \n";
            alg += "log(getNeighbours());"

            e.start(alg, network.get("nodes"), network.get("messageQ"));
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
        messageQ: DS.hasMany('App.Message'),
        rounds: DS.attr('number'),
        isIdle: DS.attr('boolean'),
        algorithm: DS.attr('string')
    });

    // One to many relationship between edges and node
    App.Node = DS.Model.extend({
        nodeId: DS.attr('number'),
        network: DS.belongsTo('App.Network'),
        edges: DS.hasMany('App.Edge'),
        messageQ: DS.hasMany('App.Message')
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
        contents: DS.attr('string') // change it to JSON?
    });

    // Load temporary data
    App.Network.FIXTURES = [{
        id: 1,
        nodes: [1, 2, 3, 4],
        edges: [1, 2, 3, 4],
        messageQ: [1],
        rounds: null,
        isIdle: true,
        algorithm: null
    }];

    App.Node.FIXTURES = [{
        id: 1,
        nodeId: 11,
        network: 1,
        edges: [1, 4],
        messageQ: []
    }, {
        id: 2,
        nodeId: 12,
        network: 1,
        edges: [1, 2],
        messageQ: []
    }, {
        id: 3,
        nodeId: 13,
        network: 1,
        edges: [2, 3],
        messageQ: []
    }, {
        id: 4,
        nodeId: 14,
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
        id: 2,
        network: 1,
        firstEnd: 2,
        secondEnd: 3
    }, {
        id: 3,
        network: 1,
        firstEnd: 3,
        secondEnd: 4
    }, {
        id: 4,
        network: 1,
        firstEnd: 4,
        secondEnd: 1
    }];

    App.Message.FIXTURES = [{
        id: 1,
        fromNode: 1,
        toNode: 2,
        contents: "foobar"
    }];


}());