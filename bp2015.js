(function() {var elements = [];
var elementEventListeners = [];
var name = "";
var roomsGetInterval = 0;
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
window.onbeforeunload = function(event) {websocket.send("close\x1c" + name);};
websocket.onclose = function(event) {console.log("WebSocket connection closed: " + event.code);};
websocket.onerror = function(event) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(event) {
	console.log("received: \"" + event.data + "\"");
	if (state == "login") {
		name = event.data;
		if (name == "true") {
			name = elements[2].value;
			rooms();
		} else {alert("Name already in use.");}
	}
	if (state == "rooms") {
		var rooms_ = event.data;
		rooms_ = rooms_.split("\x1d");
		for (var i = 0; i < rooms_.length; i++) {
			if (rooms_[i] != "") {
				rooms_ = rooms_.slice(i);
				break;
			}
			if (i == rooms_.length) {rooms_ = [];}
		}
		for (var i = 0; i < rooms_.length; i++) {
			console.log(rooms_[i]);
			var index = 7 + 4 * i;
			if (elements[index]) {elements[7 + 4 * i + 2].replaceChild(document.createTextNode((rooms_[i].split("\x1e").length - 1) + "/4"), elements[index + 2].firstChild);}
			else {
				createElement(index, "tr");
				createElementAppendTextNode(index + 1, "td", i);
				appendChild(index, index + 1);
				createElementAppendTextNode(index + 2, "td", (rooms_[i].split("\x1e").length - 1) + "/4");
				appendChild(index, index + 2);
				createElementAddEventListener(index + 3, "input", "click", roomJoin);
				elements[index + 3].setAttribute("type", "button");
				elements[index + 3].value = "Join";
				appendChild(index, index + 3);
				appendChild(2, index);
			}
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
	/*removeChildren();
	elements[0] = document.createElement("h1");
	elementTextNodes[0] = document.createTextNode("Welcome to Best Project 2015");
	elements[0].appendChild(elementTextNodes[0]);
	elements[1] = document.createElement("div");
	elementTextNodes[1] = document.createTextNode("Enter the name you will use:");
	elements[1].appendChild(elementTextNodes[1]);
	elements[2] = document.createElement("input");
	elements[3] = document.createElement("input");
	elements[3].setAttribute("type", "submit");
	elements[3].addEventListener("click", function(event) {
		websocket.send("name;" + elements[2].value);
	});
	appendChildren();*/
    document.getElementById("submit").addEventListener("click", function(event) {
	websocket.send("name;" + document.getElementById("name").value);
    });
}

function roomCreate(event) {
	
}

function roomJoin(event) {
	console.log("Join room " + (elements.indexOf(event.currentTarget) - 10) / 4);
}

function rooms() {
	state = "rooms";
	stateChange();
	createElementAppendTextNode(0, "div", "Welcome " + name);
	createElementAddEventListener(1, "input", "click", roomCreate);
	elements[1].setAttribute("type", "button");
	elements[1].value = "Create Room";
	createElement(2, "table");
	createElement(3, "tr");
	createElementAppendTextNode(4, "th", "#");
	appendChild(3, 4);
	createElementAppendTextNode(5, "th", "Players");
	appendChild(3, 5);
	createElementAppendTextNode(6, "th", "Join");
	appendChild(3, 6);
	appendChild(2, 3);
	
	//Only append the table to the document. Do not append tr or td.
	document.body.appendChild(elements[0]);
	document.body.appendChild(elements[1]);
	document.body.appendChild(elements[2]);
	roomsGet();
}

function roomsGet() {websocket.send("rooms\x1c");}

function stateChange() {
	elementsRemoveEventListeners();
	documentBodyRemoveElements();
}

login();})(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console.
