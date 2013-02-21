var Executor = function () {

    // Making it JS, automatically executes the script
    // after ajax load, which we don't really want
    // hence file without NO extension
    var HEADERJS = "js/algorithmlib",
        header = null,
        // handleMessage from workers
        handleMessage = function(event) {
            console.log(event.data);
        };


        // get algolib from the server
        getAlgoLib = function () {
            // make a synchronous jquery call to fetch algorithmlib.js
            var jqxhr = $.ajax({
                url: HEADERJS,
                success: function (data) {
                    header = data;
                },
                async: false
            });
            return header;
        },

        // limit the variables affected by script execution to
        // local function scope
        combineHeaderWithScript = function (header, script) {
            var finalScript = "(function(){ \n";
            finalScript = finalScript + header;
            finalScript = finalScript + script;
            finalScript = finalScript + "\n }()); \n";
            return finalScript;
        },

        // return the header file needed for the algorithm
        // execution
        getHeader = function () {
            if (header !== null) {
                return header;
            }
            return getAlgoLib();
        },

        // this function starts the worker threads
        startWorkers = function (script, workerCount) {
            var blob = new Blob([script]),
                workers  = Array();
                i = null;
            for (i = 0; i < workerCount; i++) {
                // initializet the web workers
                workers[i] = new Worker(window.URL.createObjectURL(blob));
                workers[i].onmessage = handleMessage;

                // signal thread to start execution
                workers[i].postMessage("{cmd: 'start', data: '" + i  + "'}");
            }
        };


    // main execution engine
    this.startAlgorithm = function (algorithm, nodesCount) {
       var scriptHeader = getHeader();
       script = combineHeaderWithScript(scriptHeader, algorithm);
       startWorkers(script, nodesCount);
    };

};