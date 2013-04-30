
define([
    'libs/load'
], function (lib) {
    'use strict';

    var App = {};
    var DS = lib.DS;

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

    return App;
});
