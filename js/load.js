requirejs.config({
    shim: {
        'libs/ember': ['libs/jquery'],
        'libs/ember-data': ['libs/ember'],
        'util': ['libs/jquery-ui']
//        'core': ['libs/ember', 'libs/ember-data', 'libs/paper', 'env']
    }
});

define([
    'core',
], function (app) {
    'use strict';
    window.App = app;

    // move this to a separate init file
    $("#dialog-form").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Ok": function () {
                var nodeId = $("#nodeId").val();
                $("#nodeId").val("");
                ENV.controller.createNewNode(nodeId);
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            ENV.canvasEditingMode = false;
        }
    });

    $("#error_dialog").dialog({
        autoOpen: false,
        modal: true
    });

    $("#nodeId").numeric({negative: false});

});