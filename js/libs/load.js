define([
    'libs/require_plugins/order!libs/jquery',
    'libs/require_plugins/order!libs/ember',
    'libs/require_plugins/order!libs/ember-data',
    'libs/require_plugins/order!libs/paper',
    // 'libs/require_plugins/order!libs/WorkerConsole',
    'libs/require_plugins/order!libs/handlebars',
    'libs/require_plugins/order!libs/jquery-ui',
    'libs/require_plugins/order!libs/jquery-numeric',
    'libs/require_plugins/order!util',
    'libs/require_plugins/order!libs/ace/ace'
], function () {
    'use strict';
    return {
        Ember: Ember,
        DS: DS
    };
});