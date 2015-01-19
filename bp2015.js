(function() {var elements = [];
var elementEventListeners = [];
var name = "";
var intervalPingPong = 0
var intervalRoomsGet = 0;
var intervalWait = 0;
var playersMax = 4;
var roomNumber = -1;
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
window.onbeforeunload = function(e) {websocket.send("close" + roomNumber + "" + name);};
websocket.onclose = function(e) {
	console.log("WebSocket connection closed: " + e.code);
	alert("Disconnected.");
	clearInterval(intervalPingPong);
	clearInterval(intervalRoomsGet);
	clearInterval(intervalWait);
	elementsRemoveEventListeners();
	elementEventListeners = [];
};
websocket.onerror = function(e) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(e) {
	console.log("received: " + JSON.stringify(e.data));
	if (e.data.split("")[0] == "chat") {
		chat = e.data.split("")[1].split("");
		if (state == "rooms") {
			elements[1].value += "\n" + chat[0] + ": " + chat[1];
		}
	} else if (state == "join") {
		if (e.data != "false") {roomCreate();}
		else {
			alert("Cannot join room that is full or in progress.");
			rooms();
		}
	} else if (state == "login") {
		if (e.data == "true") {rooms();}
		else {alert("Name already in use.");}
	} else if (state == "rooms") {//Format of room, as stored in server (ignore all spaces): Current playerPlayer 1 namePlayer 1 latitudePlayer 1 longitudeSame format for players 2-4.
		var rooms_ = e.data;
		rooms_ = rooms_.split("");
		for (var i = 0; i < rooms_.length; i++) {
			if (rooms_[i]) {
				rooms_ = rooms_.slice(i);
				break;
			}
			if (i == rooms_.length) {rooms_ = [];}
		}
		for (var i = 0; i < rooms_.length; i++) {
			var index = 13 + 4 * i;
			var playerCount = 0;
			var room = rooms_[i].split("");
			for (var j = 2; j < room.length; j++) {if (room[j].split("")[0]) {playerCount++;}}
			if (elements[index]) {
				elementReplaceTextNode(index + 1, room[0]);
				elementReplaceTextNode(index + 2, playerCount + "/" + playersMax);
			} else {
				createElement(index, "tr");
				createElementAppendTextNode(index + 1, "td", room[0]);
				appendChild(index, index + 1);
				createElementAppendTextNode(index + 2, "td", playerCount + "/" + playersMax);
				appendChild(index, index + 2);
				createElementAddEventListener(index + 3, "input", "click", roomJoin);
				elementSetAttributes(index + 3, [["type", "button"], ["value", "Join"]]);
				appendChild(index, index + 3);
				appendChild(8, index);
			}
		}
		for (var i = 13 + 4 * rooms_.length; i < elements.length; i += 4) {removeChild(8, i);}
		elements.splice(13 + 4 * rooms_.length, elements.length - (13 + 4 * rooms_.length));
	} else if (state == "wait") {
		var room = e.data.split("");
		if (room == "ready") {
			clearInterval(intervalWait);
			//Go to game
		}
		else {for (var i = 0; i < playersMax; i++) {elementReplaceTextNode(3 + i, "Player " + (i + 1) + ": " + room[1 + i].split("")[0]);}}
	} else if (state == "waitRoomNumber") {
		if (e.data != "false") {
			roomNumber = parseInt(e.data);
			roomCreate();
		}
		else {alert("Cannot create room: maximum number of rooms has been reached.");}
	}
};
websocket.onopen = function(e) {
	console.log("WebSocket connection opened.");
	intervalPingPong = setInterval(function() {websocket.send("\x06");}, 100);
};

function appendChild(parent, child) {elements[parent].appendChild(elements[child]);}

function createElement(index, element) {elements[index] = document.createElement(element);}
function createElementAddEventListener(index, element, event, eventListener) {
	elements[index] = document.createElement(element);
	elementAddEventListener(index, event, eventListener);
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

function elementAddEventListener(index, event, eventListener) {
	if (elementEventListeners[index]) {elementEventListeners[index].push([event, eventListener]);}
	else {elementEventListeners[index] = [[event, eventListener]];}
	elements[index].addEventListener(event, eventListener);
}
function elementSetAttributes(index, attributes) {for (var i = 0; i < attributes.length; i++) {elements[index][attributes[i][0]] = attributes[i][1];}}
function elementReplaceTextNode(index, text) {elements[index].replaceChild(document.createTextNode(text), elements[index].firstChild);}

function elementsRemoveEventListeners() {for (var i = 0; i < elements.length; i++) {if (elementEventListeners[i]) {for (var j = 0; j < elementEventListeners[i].length; j++) {elements[i].removeEventListener(elementEventListeners[i][j][0], elementEventListeners[i][j][1]);}}}}

function login() {
	state = "login";
	elementEventListeners[1] = [["click", function(e) {
		if (websocket.readyState == 1) {
			name = document.getElementById("name").value.trim().replace(/(|||)/g, "");
			websocket.send("name" + name);
		} else {if (websocket.readyState == 0) {alert("Connecting to server… Please wait.");}}
	}]];
	elementEventListeners[0] = [["keypress", function(e) {if (e.which == 13) {elementEventListeners[1][0][1](e);}}]];
	document.getElementById("name").addEventListener("keypress", elementEventListeners[0][0][1]);
	document.getElementById("submit").addEventListener("click", elementEventListeners[1][0][1]);
	document.getElementById("name").focus();
}

function removeChild(parent, child) {elements[parent].removeChild(elements[child]);}

function roomCreate() {
	state = "wait";
	stateChange();
	createElementAddEventListener(0, "input", "click", function(e) {
		clearInterval(intervalWait);
		websocket.send("leave" + roomNumber + "" + name);
		rooms();
	});
	elementSetAttributes(0, [["type", "button"], ["value", "Back"]]);
	createElementAppendTextNode(1, "div", "Room " + roomNumber);
	createElementAppendTextNode(2, "div", "Waiting for players...");
	for (var i = 0; i < playersMax; i++) {createElementAppendTextNode(3 + i, "div", "Player " + (i + 1) + ":");}
	documentBodyAppendElements();
	websocket.send("wait" + roomNumber + "" + name);
	intervalWait = setInterval(function() {websocket.send("wait" + roomNumber + "" + name);}, 1000);
}

function roomJoin(e) {
	clearInterval(intervalRoomsGet);
	state = "join";
	roomNumber = parseInt(elements[elements.indexOf(e.currentTarget) - 2].textContent);
	websocket.send("join" + roomNumber + "" + name);
}

function rooms() {
	state = "rooms";
	stateChange();
	roomNumber = -1;
	createElementAppendTextNode(0, "div", "Welcome " + name);
	createElement(1, "textarea");
	elementSetAttributes(1, [["cols", 100], ["readOnly", true], ["rows", 10], ["value", "Welcome to Best Project 2015 chat. Say anything!"]]);
	createElement(2, "br");
	createElementAppendTextNode(4, "span", " ");
	createElementAddEventListener(5, "input", "click", function(e) {
		chat = elements[3].value.trim().replace(/(|||)/g, "");
		if (chat) {websocket.send("chat" + roomNumber + "" + name + "" + chat);}
		elementSetAttributes(3, [["value", ""]]);
	});
	elementSetAttributes(5, [["type", "submit"]]);
	createElementAddEventListener(3, "input", "keypress", function(e) {if (e.which == 13) {elementEventListeners[5][0][1](e);}});
	elementSetAttributes(3, [["maxLength", 100], ["size", 100]]);
	createElement(6, "br");
	createElementAddEventListener(7, "input", "click", function(e) {
		state = "waitRoomNumber";
		clearInterval(intervalRoomsGet);
		stateChange();
		websocket.send("roomCreate" + name);
	});
	elementSetAttributes(7, [["type", "button"], ["value", "Create Room"]]);
	createElement(8, "table");
	createElement(9, "tr");
	createElementAppendTextNode(10, "th", "#");
	appendChild(9, 10);
	createElementAppendTextNode(11, "th", "Players");
	appendChild(9, 11);
	createElementAppendTextNode(12, "th", "Join");
	appendChild(9, 12);
	appendChild(8, 9);
	documentBodyAppendElements([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	websocket.send("rooms");
	intervalRoomsGet = setInterval(function() {websocket.send("rooms")}, 1000);
}

function stateChange() {
	elementsRemoveEventListeners();
	documentBodyRemoveElements();
}

login();})(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console. 少名　針妙丸
