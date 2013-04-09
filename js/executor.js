
// TODO:
// 1. Make this singleton pattern
// 2. Currently this script handles ember objects, may be an ember api
//    rather than playing with ember objects directly here
// 3. Add functionality to add special variables for special nodes

define([
    'env',
    'libs/load'
], function () {

    "use strict";

    return function () {
        // Making it JS, automatically executes the script
        // after ajax load, which we don't really want
        // hence file without NO extension
        var HEADERJS = "js/algorithmlib.inc",
            header = null,
            messageQ = [],
            nodes = [],
            receivedMessages = 0,
            roundsCount = 0,
            messageForWorkers = {},
            workers = [],
            currentNetwork = null,
            currentNetworkController = null,
            allNodesTerminated = false,
            startWorkerCount = 0,

            // Get node from the worker object
            getNode = function (current_worker) {
                var i;
                for (i = 0; i < workers.length; i = i + 1) {
                    var worker = workers[i];
                    if (worker.worker === current_worker) {
                        return worker.node;
                    }
                }
            },

            // traverses through all edges incident on the node
            // and find that node of the edges which has the same
            // nodeId as toNodeId
            getIncidentNodeFromId = function (fromNode, toNodeId) {
                var edges = fromNode.get("edges"),
                    i;
                for (i = 0; i < edges.content.length; i = i + 1) {
                    var edge = edges.objectAt(i);
                    if (edge.get("firstEnd").get("nodeId") === toNodeId) {
                        return edge.get("firstEnd");
                    }
                    if (edge.get("secondEnd").get("nodeId") === toNodeId) {
                        return edge.get("secondEnd");
                    }
                }
                // this should not happen
                return -1;
            },

            // Get node and edge objects from Ember and create messageQ
            formEmberMessage = function (worker, messageFromWorker) {
                var toNodeId = messageFromWorker.toNode;
                var contents = messageFromWorker.message;
                var fromNode = getNode(worker);
                var toNode   = getIncidentNodeFromId(fromNode, toNodeId);

                // move this to network model!
                var m = App.Message.createRecord({network: currentNetwork,
                    fromNode: fromNode, toNode: toNode, delivered: null, contents: contents});

                // Adding the message to node
                fromNode.get("messageQ").addObject(m);

                // Adding the messageQ to the network
                currentNetwork.get("messageQ").addObject(m);

                // add it to the node and network
                return m;
            },

            handleControlMessage = function (worker, message) {
                var nodeId = getNode(worker).get("nodeId");

                switch (message.cmd) {

                case "color":
                    currentNetworkController.setNodeColor(
                        message.args[0],
                        message.args[1],
                        nodeId
                    );
                    break;

                case "shout":
                    currentNetworkController.nodeShout(
                        message.args[0],
                        nodeId
                    );
                    break;

                default:
                    // do nothing
                }
            },

            // Accumulate all messages from Worker
            loadMessageQ = function (worker, messageFromWorker) {
                receivedMessages = receivedMessages + 1;
                messageFromWorker.forEach(function (message) {
                    // check if this is a control message form the node
                    if (message.toNode === -1) {
                        handleControlMessage(worker, message);
                    } else {
                        var msg = formEmberMessage(worker, message);
                        messageQ = messageQ.concat(msg);
                    }
                });
            },

            // Get message by nodeId
            getWorkerMessage = function (node) {
                var nodeId = node.get("nodeId");
                if (messageForWorkers.hasOwnProperty(nodeId)) {
                    return messageForWorkers[nodeId];
                }
                return null;
            },

            // start a new round by creating the message that needs to be
            // passed: array of messages specific to each node
            startNewRound = function () {
                var message = {};

                message.cmd = "round";
                startWorkerCount = workers.length;

                workers.forEach(function (worker) {
                    message.messages = getWorkerMessage(worker.node);
                    sendMessage(worker.worker, JSON.stringify(message));
                });

            },

            // kill all workers
            stopAllWorkers = function () {
                workers.forEach(function (worker) {
                    currentNetworkController.signalNodeDeath(
                        worker.node.get("nodeId")
                    );
                    worker.worker.terminate();
                });
            },

            // create client specific message object from Ember msg
            getClientMsgFromEmberMsg = function (message) {
                var msg = {};

                msg.fromNode = message.get("fromNode").get("nodeId");
                msg.toNode   = message.get("toNode").get("nodeId");
                msg.message  = message.get("contents");

                return msg;
            },

            // push the message for the corresponding nodes in the hashtable
            // messageForWorkers
            pushWorkerMessage = function (message) {
                var targetNodeId = message.get("toNode").get("nodeId");

                if (!(messageForWorkers.hasOwnProperty(targetNodeId))) {
                    messageForWorkers[targetNodeId] = [];
                }
                console.log(message.get("fromNode").get("nodeId") + " ==> " + targetNodeId);
                // convert ember object to client specific simple message
                var msg = getClientMsgFromEmberMsg(message);
                messageForWorkers[targetNodeId].push(msg);
            },

            // take all the messages in messageQ,
            // transfer the ones that are not yet delivered
            transferMessages = function () {
                messageQ.forEach(function (message) {
                    if (message.get("delivered") !== true) {
                        pushWorkerMessage(message);
                        message.set("delivered", true);
                    } else {
                        // message.deleteRecord ?
                        if (message.get("isDeleted") !== true) {
                            message.deleteRecord();
                        }
                    }
                });
            },

            checkIfAllWorkerAreDead = function () {
                // all the workers are terminated
                if (workers.length === 0 && allNodesTerminated === false) {
                    console.log("=======================================");
                    console.log("Total number of rounds: " + roundsCount);
                    console.log("Total number of messages: " + messageQ.length);
                    currentNetworkController.waitForView(roundsCount + 1);

                    allNodesTerminated = true;
                    return true;
                }

                return allNodesTerminated;
            },

            // proceed if all the live workers have given the completed signal
            // stillActive == true when sent from active thread
            checkAndStartNewRound = function () {
                if (checkIfAllWorkerAreDead() === true) {
                    return;
                }

                // When we have heard from all the workers, start a new round
                if (receivedMessages === startWorkerCount) {
                    roundsCount = roundsCount + 1;
                    receivedMessages = 0;
                    transferMessages();

                    currentNetworkController.waitForView(roundsCount);
                }

            },

            // closeWorkerThread()
            closeWorkerThread = function (worker) {
                var i;
                // terminate worker
                worker.terminate();

                for (i = 0; i < workers.length; i = i + 1) {
                    if (workers[i].worker === worker) {
                        break;
                    }
                }
                console.log("Terminating Node #" + workers[i].node.get("nodeId"));
                currentNetworkController.signalNodeDeath(
                    workers[i].node.get("nodeId")
                );

                workers.remove(i);
                // check if the workers arry is empty
                checkIfAllWorkerAreDead();
            },

            // messageHandler from workers
            messageHandler = function (event) {
                var message = JSON.parse(event.data);

                loadMessageQ(event.srcElement, message.messages);
                if (message.cmd === "close") {
                    closeWorkerThread(event.srcElement);
                }

                if (message.cmd === "close_error") {
                    this.cancelExecution();
                }

                checkAndStartNewRound();
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
            generateScript = function (algorithm) {

                // get the headscript from the server
                var header = getHeader();

                // replace while(1) with round function
                var re = /\s*while\s*\(\s*1\s*\)/;
                var replaceStr = "\n\n this.round = function () ";
                algorithm = algorithm.replace(re, replaceStr, "i");

                // find exit and replace it will close.closeThread
                re = /\s*exit;\s*/g;
                replaceStr = "\n closeThread(); \n";
                algorithm = algorithm.replace(re, replaceStr, "g");

                // decorate it with anonymizers for safety
                // (eventhought its not needed as javascript web workers run in a sandbox anyway)
                var script = "(function(){ \n";
                script = script + header;
                script = script + algorithm;
                script = script + "\n} catch(err) { signalError (err); } }; } ()); \n";

                return script;
            },

            // return the header file needed for the algorithm
            // execution
            getHeader = function () {
                if (header !== null) {
                    return header;
                }
                return getAlgoLib();
            },

            onError = function (e) {
                console.log(e);
                e.cancelBubble = true;
                e.stopPropagation();
                e.preventDefault();

                stopAllWorkers();
                currentNetworkController.executorFailed(e.message);
            },

            createWorker = function (blob) {
                var worker = new Worker(window.URL.createObjectURL(blob));
                worker.onmessage = messageHandler;
                worker.addEventListener('error', onError, false);
                return worker;
            },

            sendMessage = function (worker, message) {
                worker.postMessage(message);
            },

            getInitData = function (node) {
                var message = {};

                message.cmd = "init";
                message.id  = node.get("nodeId");
                message.neighbours = [];
                message.neighboursLocation = {};
                message.templateObject = [];

                // get sorted neighbours from the controller
                message.neighbours = currentNetworkController.getSortedNeighbours(
                    node.get("nodeId")
                );

                message.neighboursLocation = currentNetworkController.getNeighboursWithLocation(
                    node.get("nodeId")
                );

                message.templateObject = currentNetworkController.getTemplateObject(
                    node.get("nodeId")
                );

                return JSON.stringify(message);
            },

            // this function starts the worker threads
            startWorkersInNode = function (script, nodes) {
                var blob = new Blob([script]),
                    i = 0;

                // create workers for each node
                nodes.forEach(function (node) {
                    var initData = getInitData(node);

                    // create worker
                    workers[i] = {};
                    workers[i].node = node;
                    workers[i].worker = createWorker(blob);

                    // send initData after creation
                    sendMessage(workers[i].worker, initData);
                    i = i + 1;
                });

                // Start new rounds
                currentNetworkController.setupStartRounds();
                startNewRound();
            };


        // main execution engine
        this.start = function (algorithm, networkController) {
            // prepare the script for the thread
            // TODO: Extract variables at the object level :)
            // TODO: safety check
            var script = generateScript(algorithm);

            currentNetwork = networkController.content;
            var nodes = currentNetwork.get("nodes");
            currentNetworkController = networkController;

            // Read data from network
            startWorkersInNode(script, nodes);
        };

        this.cancelExecution = function () {
            stopAllWorkers();
        };

        this.signalStartNewRound = function () {

            if (workers.length === 0) {
                return currentNetworkController.cleanUpRounds();
            }

            if (roundsCount === 100) {
                // TODO: throw error
                stopAllWorkers();
                alert("Algorithm running forever in few nodes. Canceling execution.");
                currentNetworkController.cleanUpRounds();
                return;
            }

            console.log("starting  round #" + (roundsCount));

            startNewRound();
            messageForWorkers = {};
        };

    };
});