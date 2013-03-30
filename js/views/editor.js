define([
    'env',
    'libs/load',
    'libs/ace/ace'
], function (e, lib, a) {
    'use strict';

    return lib.Ember.View.extend({
        tagName: "div",
        elementId: "editor",
        attributeBindings: ['height', 'width'],
        height: ENV.canvas_height,
        width: ENV.canvas_width,
        aceObject: null,

        getAlgorithm: function () {
            return this.aceObject.getValue();
        },

        changeLayout: function (layout) {
            this.set("height", ENV.layout[layout].height);
            this.set("width", ENV.layout[layout].width);

            $("#editor").height(this.height);
            $("#editor").width(this.width);

            $("#editor_container").height(this.height);
            $("#editor_container").width(this.width);

            this.aceObject.resize();
        },

        didInsertElement: function () {
            this.get("controller").setView(this);

            $("#editor").html("");

            this.aceObject = ace.edit("editor");
            this.aceObject.setTheme("ace/theme/tomorrow_night");
            this.aceObject.setFontSize("14px");
            this.aceObject.getSession().setMode("ace/mode/javascript");
        }
    });
});