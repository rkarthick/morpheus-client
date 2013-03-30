
define([
    'env',
    'libs/load'
], function (e, lib) {

    'use strict';

    return lib.Ember.Object.extend({
        point: null,
        uiObject: null,
        ed: [],
        messagesCount: 0,

        nodeIdBinding: 'controller.nodeId',
        x: (ENV.canvas_width - ENV.node_radius) / 2,
        y: (ENV.canvas_height - ENV.node_radius) / 2,

        nodeIdChanged: function () {
            console.log("nodeId changed to: " + this.nodeId);
        }.observes('nodeId'),

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

        messageCreated: function (message) {
            var aniCircle = new paper.Path.Circle(
                this.getCenter(),
                ENV.node_radius
            );

            aniCircle.fillColor = "white";
            var currentOpacity = 1.0;
            aniCircle.opacity = currentOpacity;
            var newRadius = 1;

            this.moveAbove(aniCircle);

            var update = true;

            paper.view.onFrame = function (event) {
                if (update === true) {
                    if (newRadius > (ENV.node_radius + 10)) {
                        aniCircle.remove();
                        update = false;
                    }
                    newRadius = newRadius + 1;

                    // new radius
                    var radius = (aniCircle.bounds.width) / 2;
                    aniCircle.scale(newRadius / radius);

                    // opacity
                    currentOpacity = (currentOpacity - 0.03);
                    aniCircle.opacity = currentOpacity;
                }
            };

            // TODO: wait till the animation finishes
            var controller = this.get("controller");

            var waitForUpdate = function () {
                if (update === true) {
                    setTimeout(waitForUpdate, 50);
                    return;
                } else {
                    controller.messageAnimationComplete(message);
                }
            };
            waitForUpdate();

        },

        init: function () {
            this._super();
            this.ed = [];

            var myCircle = new paper.Path.Circle(new paper.Point(this.x, this.y),
                ENV.node_radius);
            myCircle.fillColor = ENV.node_bgcolor;
            myCircle.nodeId = this.nodeId;

            var centerPoint =  new paper.Point(this.x, this.y);
            var text = new paper.PointText(centerPoint);

            text.content = this.nodeId;
            text.characterStyle = {
                fontSize: ENV.node_font_size,
                fillColor: ENV.node_fgcolor
            };

            text.bounds.center = new paper.Point(
                this.x,
                this.y - (ENV.node_font_size / 4)
            );

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
            ENV.ctx.textBaseline = "middle";
            this.uiObject.children[1].bounds.center = new paper.Point(
                x,
                y - (ENV.node_font_size / 4)
            );
        },

        getEdges: function () {
            return this.ed;
        },

        addEdge: function (edge) {
            this.ed.push(edge);
            this.moveAbove(edge);
        },

        moveAbove: function (item) {
            this.uiObject.moveAbove(item);
        },

        setColor: function (bgColor, fgColor) {
            this.uiObject.children[0].fillColor = bgColor;
            this.uiObject.children[1].fillColor = fgColor;
        },

        shout: function (message) {
            var point = this.getCenter();
            point.y = point.y + ENV.node_radius + 30;
            point.x = point.x;

            // TODO: check edge proximity
            // create the text
            var text = new paper.PointText(point);
            text.content = message;
            text.characterStyle = {
                fontSize: ENV.shout_font_size,
                fillColor: ENV.shout_fgcolor
            };
            text.bounds.center = new paper.Point(
                point.x,
                point.y - (ENV.shout_font_size / 4)
            );

            // create the bounding rectangle
            var br = new paper.Point({
                x: (text.bounds.bottomRight.x + 20),
                y: (text.bounds.bottomRight.y + 15)
            });
            var tl = new paper.Point({
                x: (text.bounds.topLeft.x - 15),
                y: (text.bounds.topLeft.y - 10)
            });
            var rectangle = new paper.Rectangle(tl, br);
            var roundedRectangle = new paper.Path.RoundRectangle(
                rectangle,
                new paper.Size(10, 10)
            );
            roundedRectangle.fillColor = ENV.shout_bgcolor;

            text.moveAbove(roundedRectangle);

            var removeAfterSometime = function () {
                roundedRectangle.remove();
                text.remove();
            };

            setTimeout(removeAfterSometime, ENV.shout_delay);
        },

        remove: function () {
            this.uiObject.remove();
            this.ed.forEach(function (edge) {
                edge.remove();
            });
            this.ed = [];
        },

        removeEdge: function (edge) {
            var i;

            for (i = 0; i < this.ed.length; i = i + 1) {
                if (this.ed[i] === edge) {
                    break;
                }
            }
            this.ed.remove(i);
        },

        debug: function () {
            console.log('view: %@%@'.fmt(get(this, 'cx'), get(this, 'cy')));
        }
    });
});