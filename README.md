Morpheus
========

In a synchronous distributed system, an algorithm is executed in all the processors simultaneously. The understanding  and the analysis of the algorithm execution in a distributed environment can be quite challenging. Morpheus is an interactive visual algorithm simulation system for a distributed synchronous network, that can be used as a tool for algorithm visualization and simulation. The effectiveness of any learning tool is dependent on the amount of user engagement. Morpheus increases user engagement by providing the user flexibility to create and run their own algorithms in a custom network configuration specified by the user. 

Implementation Details
----------------------

Morpheus is implemented  in Javascript using HTML5. The canvas is developed using HTML5 canvas and the the thread creation in executor module uses WebWorkers functionality. WebWorker and HTML5 canvas are very recently (in 2012) introduced in the W3C specification. Hence only latest versions browsers, Firefox ($>=$$ 3.5)$, Chrome ($>=$ 4.0), Safari ($>=$ 4.0) and IE ($>=$10) support Webworkers.

Morpheus also uses a variety of javascript libraries to aid the Rapid Application Development.

1. jquery.js: Provides browser independent layer over Javascript for accessing DOM (Document Object Model) elements in HTML.
2. require.js: Enables dependency specification while loading of javascript libraries during execution.
3. paper.js: Provides path, circle and image abstractions to basic shapes in HTML5. Also provides events to drag and drop nodes and enables animation.
4. ember.js: Ember library provides MVC skeleton for javascript files.
5. aceeditor.js: The editor used in the application is the open source $aceeditor$ that comes with out of the box syntax highlighting and error reporting.
6. Modernizr.js: Lets the developer to test if the browser has canvas and webworker functionality.


File Structure
--------------

High level description of each filesdeveloped for the project.

    * algorithmlib.inc: The script that is prefixed with the algorithm before thread creation
    * algorithmmodel.js: Specifies the algorithms in ./algorithms/ directory that can be loaded into the editor using dropdown menu
    * core.js: The main ember.js application file that initializes all the model views and the controller
    * env.js: Environmental constants used in the project
    * executor.js: The executor module
    * load.js: Initial loading file that loads all the other dependent files
    * models.js: Contains the network, message, node and edge model
    * templatemodel.js: Specifies the templates in ./templates/ directory that can be loaded into the canvas using dropdown menu
    * algorithms/leaderline: The leader line algorithm in javascript that is loaded in the editor
    * algorithms/leaderring: The leader ring algorithm in javascript that is loaded in the editor
    * controllers/algorithm.js: Responsible for reading and loading the algorithm from the server
    * controllers/editor.js: Responsible for setting and getting the algorithm from the editor
    * controllers/network.js: The network controller
    * controllers/node.js: The node controller
    * templates/binarytree.js: Algorithm to create binary tree network on the canvas
    * templates/ring.js: Algorithm to create ring network on the canvas
    * templates/line.js: Algorithm to create line network on the canvas
    * views/[algorithm.js, editor.js, network.js, node.js, template.js]: contains the view related functions for respective modules


