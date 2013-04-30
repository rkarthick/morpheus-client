define([
    'libs/load',
    'env'
], function (lib, e) {
    "use strict";

    return {
        render: function (numNodes) {
            if (numNodes === undefined) {
                numNodes = prompt("Enter the number of nodes for the ring");
            }
            var radius = 230,
                next = {};

            if (isNaN(parseInt(numNodes, 10))) {
                return;
            }

            var point = new paper.Point({
                x: (ENV.canvas_width / 2),
                y: (ENV.canvas_height / 2)
            });

            var tempNodeId = 0,
                firstNode = null,
                lastNode = null,
                i = 0;

            if (ENV.canvas_width === ENV.canvas_width_big) {
                radius = (ENV.canvas_height / 2) - (ENV.node_radius * 2);
            }

            var networkController = App.rootcontroller.controllerFor("network");
            for (i = 1; i <= numNodes; i = i + 1) {
                var x = (point.x + radius * Math.cos(2 * Math.PI * i / numNodes));
                var y = (point.y + radius * Math.sin(2 * Math.PI * i / numNodes));

                lastNode = networkController.createRandomNewNode();
                if (i === 1) {
                    firstNode = lastNode;
                }
                lastNode.get("view").moveTo(new paper.Point(x, y));

                if (tempNodeId !== 0) {
                    networkController.connectNodes(lastNode.nodeId, tempNodeId);
                    next[tempNodeId] = lastNode.nodeId;
                }
                tempNodeId = lastNode.nodeId;
            }
            networkController.connectNodes(lastNode.nodeId, firstNode.nodeId);
            next[lastNode.nodeId] = firstNode.nodeId;
            paper.view.draw();

            return next;
        }
    };
});