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


    // setup navbar
    $(document).load(function(){
        var menu = $("#menu");
        var init = menu.offsetTop;
        var docked;
        window.onscroll = function () {
            if (!docked && (menu.offsetTop - scrollTop() < 0)) {
                menu.style.top = 0;
                menu.style.position = 'fixed';
                menu.className = 'docked';
                docked = true;
            } else if (docked && scrollTop() <= init) {
                menu.style.position = 'absolute';
                menu.style.top = init + 'px';
                menu.className = menu.className.replace('docked', '');
                docked = false;
            }
        }
    });


});