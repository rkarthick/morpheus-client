ENV = typeof ENV !== 'undefined' ? ENV : {
    canvas_height_small: 600,
    canvas_width_small: 557,
    canvas_height_big: 700,
    canvas_width_big: 1116,
    canvas_height: 600,
    canvas_width: 557,
    layout: [],
    edgeThreshold: 18,
    background_color: "#363838",
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
    node_bgcolor_dead: "#5d5d5d",
    node_fgcolor_dead: "#3d3d3d",
    node_bgcolor_active: "#D4B255",
    node_fgcolor_active: "#211F01",
    node_font_size: 17,
    node_font: "Arial",
    node_radius: 22,
    large_node_radius: 22,
    large_node_font_size: 17,
    large_edge_stroke_width: 5,
    small_node_radius: 2,
    small_node_font_size: 3,
    small_edge_stroke_width: 0.5,
    edge_color: "#a1a1a1",
    edge_stroke_width: 5,
    edge_color_current: "white",
    edge_stroke_width_current: 7,
    controller: null,
    canvasEditingMode: false,
    message_color: "#63A7CC",
    shout_fgcolor: "white",
    shout_bgcolor: "black",
    shout_font_size: 12,
    shout_delay: 2000,
    SIMULMODE: 1,
    EDITMODE: 2,
    banner_bgcolor: "black",
    banner_width: 60,
    banner_height: 60,
    banner_fgcolor: "#00FF80",
    banner_font_size: 35,
    layout_small: 0,
    layout_big: 1,
    msg_bgcolor: "#54924F",
    msg_fgcolor: "#f1f1f1",
    msg_fontsize: 18,
    large: 1,
    small: 0
};

ENV.layout[0] = {};
ENV.layout[0].width = ENV.canvas_width_small;
ENV.layout[0].height = ENV.canvas_height_small;

ENV.layout[1] = {};
ENV.layout[1].width = ENV.canvas_width_big;
ENV.layout[1].height = ENV.canvas_height_big;
