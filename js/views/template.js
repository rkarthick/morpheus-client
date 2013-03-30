define([
    'libs/load',
    'templates/binarytree',
    'templates/ring'
], function (lib) {
    "use strict";

    return lib.Ember.Select.extend({

        change: function (obj) {
            this.get("controller").render(this.selection);
        },

        didInsertElement: function () {

        }
    });
});