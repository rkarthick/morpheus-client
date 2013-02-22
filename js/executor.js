
// TODO:
// 1. Make this singleton pattern
// 2. Currently this script handles ember objects, may be an ember api
//    rather than playing with ember objects directly here
// 3. Add functionality to add special variables for special nodes

var Executor = function () {

    // Making it JS, automatically executes the script
    // after ajax load, which we don't really want
    // hence file without NO extension
    var HEADERJS = "js/algorithmlib",
        header = null,
        messageQ = null,

        // messageHandler from workers
        messageHandler = function (event) {
            console.log(event.data);
        },

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
            finalScript = finalScript + "\n}; } ()); \n";
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

        createWorker = function (blob) {
            var worker = new Worker(window.URL.createObjectURL(blob));
            worker.onmessage = messageHandler;
            return worker;
        },

        sendMessage = function (worker, message) {
            worker.postMessage(message);
        },

        getInitData = function (node) {
            var message = {};

            message["cmd"] = "init";
            message["id"]  = node.get("id");
            message["neighbours"] = [];

            // Populate neighbours
            node.get("edges").forEach(function (edge) {
                var targetEdge = null;
                if(edge.get("firstEnd") === node) {
                    targetEdge = "secondEnd";
                } else {
                    targetEdge = "firstEnd";
                }
                var n = {};
                n["nodeId"] = edge.get(targetEdge).get("nodeId");
                n["id"] = edge.get(targetEdge).get("id");
                message["neighbours"].push(n);
            });

            return JSON.stringify(message);
        },

        // this function starts the worker threads
        startWorkersInNode = function (script, nodes) {
            var blob = new Blob([script]),
                workers  = Array();
                i = 0;

            // create workers for each node
            nodes.forEach(function (node) {
                var initData = getInitData(node);
                // DEBUG console.log(initData)
                workers[i] = createWorker(blob);
                sendMessage(workers[i], initData);
                i++;
            });
        };


    // main execution engine
    this.start = function (algorithm, nodes, messages) {

        // prepare the script for the thread
        // TODO: safety check
        var scriptHeader = getHeader();
        script = combineHeaderWithScript(scriptHeader, algorithm);

        messageQ = messages;

        // Read data from network
        startWorkersInNode(script, nodes);
    };

};