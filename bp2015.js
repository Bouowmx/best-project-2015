(function() {var elements = []
var elementTextNodes = [];
var name = "";
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:8080");
websocket.onclose = function(event) {console.log("WebSocket connection closed: " + event.code);};
websocket.onerror = function(event) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(event) {
	console.log("received: " + event.data);
	if (state == "login") {
		name = event.data;
		if (name == "true") {
			name = elements[2].value;
			removeChildren();
			room();
		} else {
			
		}
	}
};
websocket.onopen = function(event) {console.log("WebSocket connection opened."); websocket.send("yolo");}

function appendChildren() {for (var i = 0; i < elements.length; i++) {document.body.appendChild(elements[i]);}}

function appendTable(table, row) {table.appendChild(row);}

function appendRow(row, data) {row.appendChild(data);}

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
	websocket.send("name;" + elements[2].value);
    });

}

function removeChildren() {
	for (var i = 0; i < elements.length; i++) {document.body.removeChild(elements[i]);}
	elements = [];
	elementTextNodes = [];
}

function room() {
	removeChildren();
	elements[0] = document.createElement("div");
	elementTextNodes[0] = document.createTextNode("Welcome " + name);
	elements[0].appendChild(elementTextNodes[0]);
	//Get rooms (lol)
	elements[1] = document.createElement("table");
	elements[2] = document.createElement("tr");
	elements[1].appendChild(elements[2]);
	elements[3] = document.createElement("th");
	elementTextNodes[3] = document.createTextNode("ID");
	elements[3].appendChild(elementTextNodes[3]);
	elements[2].appendChild(elements[3]);
	elements[4] = document.createElement("th");
	elementTextNodes[4] = document.createTextNode("Players");
	elements[4].appendChild(elementTextNodes[4]);
	elements[2].appendChild(elements[4]);
	
	//Only append the table. Do not append tr or td.
	document.body.appendChild(elements[0]);
	document.body.appendChild(elements[1]);
	//appendChildren();
}
login();})();
