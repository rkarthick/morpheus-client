
define([
    'env',
    'libs/load'
], function (e, lib) {

    'use strict';

    return lib.Ember.Object.extend({
        point: null,
        uiObject: null,
        ed: [],

        nodeIdBinding: 'controller.nodeId',
        x: (ENV.canvas_width - ENV.node_radius) / 2,
        y: (ENV.canvas_height - ENV.node_radius) / 2,

        nodeIdChanged: function () {
            console.log("nodeId changed to: " + this.nodeId);
        }.observes('nodeId'),

        getTextXPosition: function (x, text) {
            ENV.ctx.font = ENV.node_font_size.toString() + "pt " + ENV.node_font;
            ENV.ctx.textBaseline = "middle";

            return (x - (ENV.ctx.measureText(text).width / 2));
        },

        getRadius: function () {
            var circle = this.uiObject.children[0];
            return ((circle.bounds.topRight.x - circle.bounds.topLeft.x) / 2);
        },

        getCenter: function () {
            var radius = this.getRadius(),
                circle = this.uiObject.children[0];

            return new paper.Point(
                circle.bounds.topLeft.x + radius,
                circle.bounds.topLeft.y + radius
            );
        },

        init: function () {
            this._super();
            this.ed = [];

            var myCircle = new paper.Path.Circle(new paper.Point(this.x, this.y),
                ENV.node_radius);
            myCircle.fillColor = ENV.node_bgcolor;
            myCircle.nodeId = this.nodeId;
            myCircle.onMouseEnter = function () {
                this.fillColor = "red";
            };

            var text = new paper.PointText(new paper.Point(
                    this.getTextXPosition(this.x, this.nodeId),
                    this.y
                ));
            text.content = this.nodeId;
            text.characterStyle = {
                fontSize: ENV.node_font_size,
                fillColor: ENV.node_fgcolor
            };

            this.uiObject = new paper.Group([myCircle, text]);

            paper.view.draw();
        },

        getNodeId: function () {
            return parseInt(this.nodeId, 10);
        },

        moveTo: function (point) {
            var x = point.x,
                y = point.y,
                i = 0;

            // Move the edge along with the uiObject
            var nodeCenter = this.getCenter();
            this.ed.forEach(function (edge) {
                edge.getSegments().forEach(function (segment) {
                    var segmentPoint = segment.getPoint();
                    if (segmentPoint.x === nodeCenter.x &&
                            segmentPoint.y === nodeCenter.y) {
                        segment.point = point;
                    }
                });
            });

            // Move the uiobject (Unfortunately group move is not working)
            this.uiObject.children[0].position = point;
            this.uiObject.children[1].position = new paper.Point(
                this.getTextXPosition(x, this.nodeId),
                y
            );
        },

        // getEdges: function () {
        //     return this.edges;
        // },

        addEdge: function (edge) {
            this.ed.push(edge);
            this.moveAbove(edge);
        },

        moveAbove: function (item) {
            this.uiObject.moveAbove(item);
        },

        remove: function () {
            this.uiObject.remove();
            this.ed.forEach(function (edge) {
                edge.remove();
            });
            this.ed = [];
        },

        debug: function () {
            console.log('view: %@%@'.fmt(get(this, 'cx'), get(this, 'cy')));
        }
    });
});