
var Node = function (x, y, id) {

    "use strict";

    this.constructor.createEdge = function (node1, node2) {
        var path = new paper.Path.Line(node1.getCenter(), node2.getCenter());

        // TODO: Move the globals to configuration JS
        path.strokeColor = "white";
        path.strokeWidth = 8;

        node1.moveAbove(path);
        node2.moveAbove(path);

        return path;
    };

    this.constructor.connectNodes = function (node1, node2) {
        var edge = Node.createEdge(node1, node2);
        var node2Center = node2.getCenter();

        // check if the edge is already there, if there delete
        node1.getEdges().forEach(function (edge) {
            edge.getSegments().forEach(function (segment) {
                var segmentPoint = segment.getPoint();
                if (segmentPoint.x === node2Center.x &&
                        segmentPoint.y === node2Center.y) {
                    // console.log("edge already found!");
                    return;
                }
            });
        });


        node1.addEdge(edge);
        node2.addEdge(edge);
    };


    var node_bgcolor = "#c5c5c5",
        node_fgcolor = "#1a1a1a",
        node_font_size = 20,
        node_font = "Arial",
        node_radius = 28,
        edge_color = "white",
        edge_width = 8,
        uiObject = null,
        nodeId = null,
        edges = [],


        getTextXPosition = function (x, text) {

            Node.ctx.font = node_font_size.toString() + "pt " + node_font;
            Node.ctx.textBaseline = "middle";

            return (x - (Node.ctx.measureText(text).width / 2));
        },

        create = function (x, y, id) {
            nodeId = id;

            var myCircle = new paper.Path.Circle(new paper.Point(x, y), node_radius);
            myCircle.fillColor = node_bgcolor;
            myCircle.nodeId = nodeId;

            myCircle.onMouseEnter = function () {
                this.fillColor = "red";
            }

            var text = new paper.PointText(new paper.Point(x, y));
            text.content = nodeId;
            text.characterStyle = {
                fontSize: node_font_size,
                fillColor: node_fgcolor
            };
            text.position = new paper.Point(getTextXPosition(x, nodeId), y);

            uiObject = new paper.Group([myCircle, text]);
        },

        getRadius = function () {
            var circle = uiObject.children[0];
            return ((circle.bounds.topRight.x - circle.bounds.topLeft.x) / 2);
        },

        moveNode = function (node, point) {

        };


    this.getCenter = function () {
        var radius = getRadius(),
            circle = uiObject.children[0];
        return new paper.Point(circle.bounds.topLeft.x + radius, circle.bounds.topLeft.y + radius);
    };

    this.moveAbove = function (item) {
        uiObject.moveAbove(item);
    };

    this.addEdge = function (edge) {
        edges.push(edge);
    };

    this.moveTo = function (point) {
        var x = point.x,
            y = point.y,
            i = 0;


        // Move the edge along with the uiObject
        var nodeCenter = this.getCenter();
        edges.forEach(function (edge) {
            edge.getSegments().forEach(function (segment) {
                var segmentPoint = segment.getPoint();
                if (segmentPoint.x === nodeCenter.x &&
                        segmentPoint.y === nodeCenter.y) {
                    segment.point = point;
                }
            });
        });

        // Move the uiobject (Unfortunately group move is not working)
        uiObject.children[0].position = point;
        uiObject.children[1].position = new paper.Point(getTextXPosition(x, nodeId), y);
    };

    this.getNodeId = function () {
        return nodeId;
    };

    this.remove = function () {
        uiObject.remove();
        edges.forEach(function (edge) {
            edge.remove();
        });
        edges = [];
    }

    this.getEdges = function () {
        return edges;
    }


    create(x, y, id);
};
