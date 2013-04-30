
define([
    'libs/load'
], function (lib) {
    "use strict";

    return lib.Ember.ObjectController.extend({

        view: null,

        setView: function (view) {
            this.view = view;
        },

        render: function (templateName) {
            this.controllerFor('network').clear();

            templateName = templateName.toLowerCase();
            if (templateName === "custom") {
                return;
            }

            var renderer = require("templates/" + templateName);
            this.controllerFor('network').set("templateObject", renderer.render());
        }
    });
});

