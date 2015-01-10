(function() {var elements = [];
var elementEventListeners = [];
var name = "";
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
window.onbeforeunload = function(event) {websocket.send("close;" + name);};
websocket.onclose = function(event) {console.log("WebSocket connection closed: " + event.code);};
websocket.onerror = function(event) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(event) {
	console.log("received: " + event.data);
	if (state == "login") {
		name = event.data;
		if (name == "true") {
			name = elements[2].value;
			room();
		} else {
			
		}
	}
};
websocket.onopen = function(event) {console.log("WebSocket connection opened.");};

function appendChild(parent, child) {elements[parent].appendChild(elements[child]);}

function createElement(index, element) {elements[index] = document.createElement(element);}
function createTextNode(index, text) {elementTextNodes[index] = document.createTextNode(text);}
function createElementAddEventListener(index, element, event, eventListener) {
	elements[index] = document.createElement(element);
	elementEventListeners[index] = eventListener;
	elements[index].addEventListener(event, elementEventListeners[index]);
}
function createElementAppendTextNode(index, element, text) {
	elements[index] = document.createElement(element);
	elements[index].appendChild(document.createTextNode(text));
}

function documentBodyAppendElements() {for (var i = 0; i < elements.length; i++) {document.body.appendChild(elements[i]);}}
function documentBodyRemoveElements() {
	for (var i = 0; i < elements.length; i++) {document.body.removeChild(elements[i]);}
	elements = [];
}

function elementsRemoveEventListeners() {for (var i = 0; i < elements.length; i++) {elements[i].removeEventListener(elementEventListeners[i]);}}

function login() {
	state = "login";
	stateChange();
	createElementAppendTextNode(0, "h1", "Welcome to Best Project 2015");
	createElementAppendTextNode(1, "div", "Enter the name you will use:");
	createElementAddEventListener(2, "input", "keypress", function(event) {if (event.which == 13) {websocket.send("name;" + elements[2].value);}});
	createElementAppendTextNode(3, "span", " ");
	createElementAddEventListener(4, "input", "click", function(event) {websocket.send("name;" + elements[2].value);});
	elements[4].setAttribute("type", "submit");
	documentBodyAppendElements();
}

function room() {
	state = "room";
	stateChange();
	createElementAppendTextNode(0, "div", "Welcome " + name);
	createElement(1, "table");
	createElement(2, "tr");
	appendChild(1, 2); //Append tr to table.
	createElementAppendTextNode(3, "th", "ID");
	appendChild(2, 3); //And append th or td to tr.
	createElementAppendTextNode(4, "th", "Players");
	appendChild(2, 4);
	
	//Only append the table to the document. Do not append tr or td.
	document.body.appendChild(elements[0]);
	document.body.appendChild(elements[1]);
}

function stateChange() {
	elementsRemoveEventListeners();
	documentBodyRemoveElements();
}

login();})(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console.
