define([
    'libs/load',
    'executor'
], function (lib, Executor) {
    'use strict';

    return lib.Ember.ObjectController.extend({

        view: null,

        getAlgorithm: function () {
            return this.get("view").getAlgorithm();
        },

        setAlgorithm: function (algorithm) {
            return this.get("view").setAlgorithm(algorithm);
        },

        setView: function (view) {
            this.view = view;
        },

        changeLayout: function (layout) {
            this.get("view").changeLayout(layout);
        }
    });
});