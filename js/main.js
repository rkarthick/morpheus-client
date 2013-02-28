requirejs.config({
    shim: {
        'libs/ember': ['libs/jquery'],
        'libs/ember-data': ['libs/ember'],
        'app': ['libs/ember', 'libs/ember-data']
    }
})

requirejs([
        'libs/WorkerConsole',
        'libs/jquery',
        'libs/handlebars',
        'libs/ember',
        'libs/ember-data',
        'libs/paper',
        'app',
        'util',
        'executor',
        'node',
        'network',
        'test'
], function() {
        startTest();
});