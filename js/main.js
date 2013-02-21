
requirejs([
    'libs/jquery',
    'libs/WorkerConsole',
    'worker-globals',
    'libs/handlebars',
    'libs/ember',
    'libs/ember-data',
    'app',
    'executor',
    'test'
    ],
    function() {
        startTest();
   }
);

/*
    <script src="js/libs/jquery.js"></script>
    <script src="js/libs/handlebars.js"></script>
    <script src="js/libs/ember.js"></script>
    <script src="js/libs/ember-data.js"></script>
    <script src="js/app.js"></script>
*/
