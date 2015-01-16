(function() {var elements = [];
var elementEventListeners = [];
var name = "";
var intervalRoomsGet = 0;
var intervalWait = 0;
var playersMax = 4;
var roomNumber = -1;
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
window.onbeforeunload = function(event) {websocket.send("close\x1c" + roomNumber + "\x1f" + name);};
websocket.onclose = function(event) {console.log("WebSocket connection closed: " + event.code);};
websocket.onerror = function(event) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(event) {
	console.log("received: \"" + event.data + "\"");
	if (state == "join") {
		if (event.data == "false") {
			alert("Cannot join room that is full or in progress.");
			rooms();
		} else {roomCreate();}
	} else if (state == "login") {
		if (event.data == "true") {
			name = document.getElementById("name").value;
			rooms();
		} else {alert("Name already in use.");}
	} else if (state == "rooms") {//Format of room, as stored in server (ignore all spaces): Current player\x1ePlayer 1 name\x1fPlayer 1 latitude\x1fPlayer 1 longitude\x1eSame format for players 2-4.
		var rooms_ = event.data;
		rooms_ = rooms_.split("\x1d");
		for (var i = 0; i < rooms_.length; i++) {
			if (rooms_[i]) {
				rooms_ = rooms_.slice(i);
				break;
			}
			if (i == rooms_.length) {rooms_ = [];}
		}
		for (var i = 0; i < rooms_.length; i++) {
			var index = 7 + 4 * i;
			var playerCount = 0;
			var room = rooms_[i].split("\x1e");
			for (var j = 2; j < room.length; j++) {if (room[j].split("\x1f")[0]) {playerCount++;}}
			if (elements[index]) {elements[index + 2].replaceChild(document.createTextNode(playerCount + "/" + playersMax), elements[index + 2].firstChild);} 
			else {
				createElement(index, "tr");
				createElementAppendTextNode(index + 1, "td", rooms_[i].split("\x1e")[0]);
				appendChild(index, index + 1);
				createElementAppendTextNode(index + 2, "td", playerCount + "/" + playersMax);
				appendChild(index, index + 2);
				createElementAddEventListener(index + 3, "input", "click", roomJoin);
				elements[index + 3].setAttribute("type", "button");
				elements[index + 3].value = "Join";
				appendChild(index, index + 3);
				appendChild(2, index);
			}
		}
		for (var i = 7 + 4 * rooms_.length; i < elements.length; i += 4) {removeChild(2, i);}
		elements.splice(7 + 4 * rooms_.length, elements.length - (7 + 4 * rooms_.length));
	} else if (state == "wait") {
		var room = event.data.split("\x1e");
		if (room == "ready") {
			clearInterval(intervalWait);
			//Go to game
		}
		else {for (var i = 0; i < playersMax; i++) {elements[2 + i].replaceChild(document.createTextNode("Player " + (i + 1) + ": " + room[1 + i].split("\x1f")[0]), elements[2 + i].firstChild);}}
	} else if (state == "waitRoomNumber") {
		roomNumber = parseInt(event.data);
		roomCreate();
	}
};
websocket.onopen = function(event) {console.log("WebSocket connection opened.");};

function appendChild(parent, child) {elements[parent].appendChild(elements[child]);}

function createElement(index, element) {elements[index] = document.createElement(element);}
function createElementAddEventListener(index, element, event, eventListener) {
	elements[index] = document.createElement(element);
	elementEventListeners[index] = eventListener;
	elements[index].addEventListener(event, elementEventListeners[index]);
}
function createElementAppendTextNode(index, element, text) {
	elements[index] = document.createElement(element);
	elements[index].appendChild(document.createTextNode(text));
}

function documentBodyAppendElements(indexes) {
	if (indexes) {for (var i = 0; i < indexes.length; i++) {document.body.appendChild(elements[indexes[i]]);}}
	else {for (var i = 0; i < elements.length; i++) {document.body.appendChild(elements[i]);}}
}
function documentBodyRemoveElements() {
	while (document.body.firstChild) {document.body.removeChild(document.body.firstChild);}
	elements = [];
}

function elementsRemoveEventListeners() {for (var i = 0; i < elements.length; i++) {elements[i].removeEventListener(elementEventListeners[i]);}}

function login() {
	state = "login";
	elementEventListeners[0] = function(event) {
		if (websocket.readyState == 1) {if (event.which == 13) {websocket.send("name\x1c" + document.getElementById("name").value);}}
		else {alert("Connecting to server.... Please wait.");}
	};
	elementEventListeners[1] = function(event) {
		if (websocket.readyState == 1) {websocket.send("name\x1c" + document.getElementById("name").value);}
		else {alert("Connecting to server.... Please wait.");}
	}
	document.getElementById("name").addEventListener("keypress", elementEventListeners[0]);
	document.getElementById("submit").addEventListener("click", elementEventListeners[1]);
	document.getElementById("name").focus()
}

function removeChild(parent, child) {elements[parent].removeChild(elements[child]);}

function roomCreate() {
	state = "wait";
	stateChange();
	createElementAppendTextNode(0, "div", "Room " + roomNumber);
	createElementAppendTextNode(1, "div", "Waiting for players...");
	for (var i = 0; i < playersMax; i++) {createElementAppendTextNode(2 + i, "div", "Player " + (i + 1) + ":");}
	documentBodyAppendElements();
	websocket.send("wait\x1c" + roomNumber + "\x1f" + name);
	intervalWait = setInterval(function() {websocket.send("wait\x1c" + roomNumber + "\x1f" + name);}, 1000);
}

function roomJoin(event) {
	console.log("Join room " + elements[elements.indexOf(event.currentTarget) - 2].textContent);
	clearInterval(intervalRoomsGet);
	state = "join";
	roomNumber = parseInt(elements[elements.indexOf(event.currentTarget) - 2].textContent);
	websocket.send("join\x1c" + roomNumber + "\x1f" + name);
}

function rooms() {
	state = "rooms";
	stateChange();
	createElementAppendTextNode(0, "div", "Welcome " + name);
	createElementAddEventListener(1, "input", "click", function(event) {
		state = "waitRoomNumber";
		clearInterval(intervalRoomsGet);
		stateChange();
		websocket.send("roomCreate\x1c" + name);
	});
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
	documentBodyAppendElements([0, 1, 2]);
	websocket.send("rooms\x1c");
	intervalRoomsGet = setInterval(function() {websocket.send("rooms\x1c")}, 1000);
}

function stateChange() {
	elementsRemoveEventListeners();
	documentBodyRemoveElements();
}

login();})(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console. 少名　針妙丸
