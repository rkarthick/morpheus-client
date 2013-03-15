// functions used by the algorithm to interact
// with dbsim.
// TODO: Add google caja or adsafe support

// this is is the worker thread
var algoNeigh = null;
var algoId = null;
var inMessageQ = [];
var outMessageQ = [];
var code = null;

// message id carries the id for the thread, initially
var initializeState = function (message) {
    algoNeigh = message.neighbours;
    algoId = message.id;
};

// At the start of every round, combine the messageQ array
// with messages got from the main thread
var loadMessages = function (messages) {
    // inMessageQ = inMessageQ.concat(messages["messages"]);
    inMessageQ = messages.messages;
};

// At the end of every round, if the outMessageQ has messages
// send it to the main thread
var notifyRoundEndWithOutMessages = function () {
    var message = {};
    message.cmd = "round_end";
    message.messages = outMessageQ;

    self.postMessage(JSON.stringify(message));
    outMessageQ = [];
};

onmessage = function(event) {
    // get the JSON object
    var message = JSON.parse(event.data);

    switch(message.cmd) {

        case "init":
            // init the environment with node and neighbour information
            initializeState(message);
            // run the initial part of the algorithm
            code = new codeBlock();
            break;

        case "round":
            // get messages from main thread
            loadMessages(message);
            // execute the round
            code.round();
            // send end notification with sending out messages
            notifyRoundEndWithOutMessages();
            break;

        default:
            // TODO: throw this should not be reached exception
    }

};

var getId = function() {
    return algoId;
};

var getNeighbours = function () {
    var neighbours = [];

    var i = 0;
    algoNeigh.forEach(function(){
        neighbours[i] = algoNeigh[i];
        i++;
    });

    return neighbours;
};

var messagesToReceive = function () {
    var retval = inMessageQ ? inMessageQ.length : 0;
    return retval;
};

var send = function (node, msg) {
    var message = {};

    message.toNode = node;
    message.message = msg;

    outMessageQ.push(message);
};

var formCommandMessage = function (cmd, args) {
    var message = {};

    message.toNode = -1;
    message.cmd = cmd;
    message.args = args;

    outMessageQ.push(message);
};

var setColor = function(bgColor, fgColor) {
    formCommandMessage("color", [bgColor, fgColor]);
};

var shout = function(msg) {
    formCommandMessage("shout", [msg]);
};

var receive = function () {
    return inMessageQ.pop();
};

var message = function (msg) {
    this.data = msg;
};

/*
var log = function(msg) {
    console.log(msg);
};*/

var closeThread = function() {

    var message = {};
    message.cmd = "close";
    message.messages = outMessageQ;

    self.postMessage(JSON.stringify(message));
    self.close();
};

var codeBlock = function () {
