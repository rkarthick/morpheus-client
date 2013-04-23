define([
    'libs/load'
], function (lib) {
    "use strict";

    return {
        render: function () {
            var numLevels = prompt("Enter the levels for the binary tree:"),
                i = 1,
                j = 0,
                interval = 275,
                bt = {};

            numLevels = parseInt(numLevels, 10);
            if (isNaN(numLevels)) {
                return;
            }

            if (ENV.canvas_width === ENV.canvas_width_big) {
                interval = 550;
            }

            var networkController = App.rootcontroller.controllerFor("network");

            var constructBT = function (x, y, level, parentNode) {

                if (level === numLevels) {
                    return null;
                }

                var point = new paper.Point({
                    x: x,
                    y: y
                });
                var n = networkController.createRandomNewNode();
                n.get("view").moveTo(point);
                level = level + 1;
                if (parentNode !== undefined) {
                    networkController.connectNodes(n.nodeId, parentNode.nodeId);
                }

                bt[n.nodeId] = {};
                bt[n.nodeId].parent = null;
                if (parentNode !== undefined) {
                    bt[n.nodeId].parent = parentNode.nodeId;
                }

                y = y + 100;

                var gap = interval / Math.pow(2, level);

                bt[n.nodeId].children = [
                    constructBT((x - gap), y, level, n),
                    constructBT((x + gap), y, level, n)
                ];
                return n.nodeId;
            };
            constructBT((ENV.canvas_width / 2), 50, 0);

            paper.view.draw();
            console.log(bt);
            return bt;
        }
    };
});