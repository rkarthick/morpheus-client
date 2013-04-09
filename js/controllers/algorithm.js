
define([
    'libs/load'
], function (lib) {
    "use strict";

    return lib.Ember.ObjectController.extend({

        view: null,

        setView: function (view) {
            this.view = view;
        },

        render: function (algorithmName) {
            algorithmName = algorithmName.toLowerCase();
            if (algorithmName === "custom") {
                return;
            }

            var algorithm = this.readAlgorithm(algorithmName);
            App.rootcontroller.loadAlgorithm(algorithm);
        },

        readAlgorithm: function (algorithmName) {
            // make a synchronous jquery call to fetch algorithmlib.js
            var algorithm;
            var jqxhr = $.ajax({
                url: "js/algorithms/" + algorithmName,
                success: function (data) {
                    algorithm = data;
                },
                async: false
            });
            return algorithm;
        }

    });
});

