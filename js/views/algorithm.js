define([
    'libs/load'
], function (lib) {
    "use strict";

    return lib.Ember.Select.extend({

        change: function (obj) {
            this.get("controller").readAlg(this.selection);
        },

        didInsertElement: function () {

        }
    });
});