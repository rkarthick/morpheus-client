define([
    'libs/load',
    'env'
], function (lib, e) {
    "use strict";

    return {
        render: function () {
            var numNodes = prompt("Enter the number of nodes for the line");
            var interval = 100;

            if (isNaN(parseInt(numNodes, 10))) {
                return;
            }

            var point = new paper.Point({
                x: (ENV.canvas_width / 2),
                y: (ENV.canvas_height / 2)
            });

            var i,
                lastNodes = [],
                tempNodeId = 0;

            var networkController = App.rootcontroller.controllerFor("network");
            var ln = networkController.createRandomNewNode();
            ln.get("view").moveTo(point);
            lastNodes[1] = lastNodes[0] = ln.nodeId;

            for (i = 0; i < (numNodes - 1); i = i + 1) {
                var x = (point.x + (Math.pow(-1, i) * (Math.floor(i / 2) + 1) * interval));
                var y = point.y;
                var j = (i % 2);

                ln = networkController.createRandomNewNode();
                ln.get("view").moveTo(new paper.Point(x, y));
                networkController.connectNodes(ln.nodeId, lastNodes[j]);

                lastNodes[j] = ln.nodeId;
            }

            paper.view.draw();

            return null;
        }
    };
});