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
        'app',
        'util',
        'executor',
        'test'
], function() {
        startTest();
});