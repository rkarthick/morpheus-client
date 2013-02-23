// invoke Executor with the algorithm

// codeBlock = function () {
//     var msg="yes";
//     this.round = function() {
//         console.log(msg);
//     }
// };
// a = new codeBlock();
// a.round();

$(document).ready(function(){
    var triggerStart = function () {
        if($("#startSim")) {
            $("#startSim").trigger("click");
        } else {
            setTimeout(triggerStart, 3000);
        }
    };
    setTimeout(triggerStart, 1000);
});

var startTest = function () {

};

