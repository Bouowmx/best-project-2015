var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
function sendTest() {
	websocket.send("Hello world!");
};

websocket.onclose = function(e) {console.log("Connection closed. Code " + e.code + ".");};
websocket.onerror = function(e) {console.log("Error occurred.");};
websocket.onmessage = function(e) {console.log("received: " + e.data);};
websocket.onopen = function(e) {
	console.log("Connection successful.");
	setInterval(sendTest, 1000);
};

