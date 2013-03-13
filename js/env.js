ENV = typeof ENV !== 'undefined' ? ENV : {
    canvas_height: 700,
    canvas_width: 700,
    edgeThreshold: 18,
    background_color: "#3d3d3d",
    hitOptions: {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 10
    },
    canvas: null,
    ctx: null,
    node_bgcolor:  "#c5c5c5",
    node_fgcolor: "#1a1a1a",
    node_font_size: 20,
    node_font: "Arial",
    node_radius: 28,
    edge_color: "white",
    edge_stroke_width: 8,
    controller: null,
    canvasEditingMode: false
};