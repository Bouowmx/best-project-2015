//function() {
var elements = [];
elementsIndexChat = 0;
var elementEventListeners = [];
var name = "";
var intervalPingPong = 0
var intervalRoomsGet = 0;
var intervalWait = 0;
var playersMax = 4;
var roomNumber = -1;
var players = [];
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
//The following line and many lines after contain non-printable characters. You will need an editor that can show these characters: https://cloud.githubusercontent.com/assets/5422757/5805445/c669363c-9fdc-11e4-8fe8-a18b743a21d7.png
window.onbeforeunload = function(e) {websocket.send("close" + roomNumber + "" + name);};
websocket.onclose = function(e) {
	console.log("WebSocket connection closed: " + e.code);
	clearInterval(intervalPingPong);
	clearInterval(intervalRoomsGet);
	clearInterval(intervalWait);
	if (state == "login") {
		document.getElementById("name").removeEventListener(elementEventListeners[0][0][0], elementEventListeners[0][0][1]);
		document.getElementById("submit").removeEventListener(elementEventListeners[1][0][0], elementEventListeners[1][0][1]);
	} else {
		elementsRemoveEventListeners();
		elementEventListeners = [];
	}
	alert("Disconnected.");
};
websocket.onerror = function(e) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(e) {
	console.log("received: " + JSON.stringify(e.data));
	if (e.data.split("")[0] == "chat") {
		chat_ = e.data.split("")[1].split("");
		if (elements[elementsIndexChat].value.split("\n").length == 100) {elements[elementsIndexChat].value = elements[elementsIndexChat].value.slice(0, elements[elementsIndexChat].value.lastIndexOf("\n", elements[elementsIndexChat].value.length - 1));}
		elements[elementsIndexChat].value = chat_[0] + ": " + chat_[1] + "\n" + elements[elementsIndexChat].value;
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
		    state = "ingame";
		}
		else {for (var i = 0; i < playersMax; i++) {elementReplaceTextNode(10 + i, "Player " + (i + 1) + ": " + room[1 + i].split("")[0]);}}
	} else if (state == "waitRoomNumber") {
		if (e.data != "false") {
			roomNumber = parseInt(e.data);
			roomCreate();
		}
		else {alert("Cannot create room: maximum number of rooms has been reached.");}
	} else if (state == "ingame") {
	    gameCreate();
	}
};
websocket.onopen = function(e) {
	console.log("WebSocket connection opened.");
	intervalPingPong = setInterval(function() {websocket.send("");}, 100);
};

function appendChild(parent, child) {elements[parent].appendChild(elements[child]);}

function chat(index) {
	elementsIndexChat = index;
	createElement(elementsIndexChat, "textarea");
	elementSetAttributes(elementsIndexChat, [["cols", 100], ["readOnly", true], ["rows", 10], ["value", "Welcome to Best Project 2015 chat. Say anything!"]]);
	createElement(elementsIndexChat + 1, "br");
	createElementAppendTextNode(elementsIndexChat + 3, "span", " ");
	createElementAddEventListener(elementsIndexChat + 4, "input", "click", function(e) {
		chat_ = elements[elementsIndexChat + 2].value.trim().replace(/(|||)/g, "");
		if (chat_) {websocket.send("chat" + roomNumber + "" + name + "" + chat_);}
		elementSetAttributes(elementsIndexChat + 2, [["value", ""]]);
	});
	elementSetAttributes(elementsIndexChat + 4, [["type", "submit"]]);
	createElementAddEventListener(elementsIndexChat + 2, "input", "keypress", function(e) {if (e.which == 13) {elementEventListeners[5][0][1](e);}});
	elementSetAttributes(elementsIndexChat + 2, [["maxLength", 100], ["size", 100]]);
	createElement(elementsIndexChat + 5, "br");
}

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
	document.getElementById("name").addEventListener(elementEventListeners[0][0][0], elementEventListeners[0][0][1]);
	document.getElementById("name")["maxLength"] = 100;
	document.getElementById("submit").addEventListener(elementEventListeners[1][0][0], elementEventListeners[1][0][1]);
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
	createElement(1, "br");
	chat(2);
	createElementAppendTextNode(8, "div", "Room " + roomNumber);
	createElementAppendTextNode(9, "div", "Waiting for players...");
	for (var i = 0; i < playersMax; i++) {createElementAppendTextNode(10 + i, "div", "Player " + (i + 1) + ":");}
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
	chat(1);
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

// MAPS.JS ====================================================================
var maxdist = 3000 ;
function removemax(){
    //breaks movement limit to help in bug testing
    maxdist = 90999090090909;
}
function readdmax(){
    //the actual way to impose a movement limit
    maxdist = 3000;
}

function circleDrawer(m,c,r){
    //creates a circle object that
    //m is the map to draw this circle on
    //c is the center of this circle in latLng
    //r is the radius in some arbritary google unit
    return {strokeColor:"FF0000",
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: "#FF0000",
            map: m,
            center: c,
            radius: r,
	    clickable: false
	   };
}

function findPos(obj) {
    //locates the canvas $("#map")
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
	    curleft += obj.offsetLeft;
	    curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
function initialize() {
    //starts the game without polluting global name space
    removemax();
    ////////////////////////////////////////
    //SETTING UP THE CANVAS (STATIC IMAGE)//
    ////////////////////////////////////////
    var canvas = document.getElementById("map");
    var context = canvas.getContext('2d');
    
    var imageObj = new Image();
    imageObj.onload = function(){
	context.drawImage(imageObj,0,0);
    };
    imageObj.crossOrigin='http://maps.googleapis.com/crossdomain.xml';
    imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center=40.6772917298741,-73.89129638671875&zoom=13&size=1x1&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
    

    ////////////////////////////
    //SETTING UP THE NY BOUNDS//
    ////////////////////////////
    var lowerbound = 40.53898024667195;
    var leftbound = -74.26071166992188;
    var rightbound = -73.71081975097656;
    var upperbound = 40.89275342420696;
    var leftboundnosi = -74.0423583984375;
    
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 10});


    ///////////////////////////////////
    //SETTING UP A RANDOM SPAWN POINT//
    ///////////////////////////////////
    var randomspawns = [
	new google.maps.LatLng(40.688343, -73.990517),
	new google.maps.LatLng(40.618668, -74.008198),
	new google.maps.LatLng(40.589474, -73.967171),
	new google.maps.LatLng(40.591429, -73.897648),
	new google.maps.LatLng(40.585066, -73.816452),
	new google.maps.LatLng(40.556119, -73.922195),
	new google.maps.LatLng(40.638235, -73.930435),
	new google.maps.LatLng(40.684852, -73.837395),
	new google.maps.LatLng(40.724153, -73.844261),
	new google.maps.LatLng(40.748086, -73.864174),
	new google.maps.LatLng(40.789688, -73.884430),
	new google.maps.LatLng(40.774611, -73.933525),
	new google.maps.LatLng(40.710101, -74.005280),
	new google.maps.LatLng(40.731178, -74.002533),
	new google.maps.LatLng(40.754848, -73.981934),
	new google.maps.LatLng(40.781890, -73.965454),
	new google.maps.LatLng(40.807102, -73.942108),
	new google.maps.LatLng(40.837759, -73.939018),
	new google.maps.LatLng(40.834382, -73.906059),
	new google.maps.LatLng(40.820873, -73.855591),
	new google.maps.LatLng(40.788909, -73.805122),
	new google.maps.LatLng(40.747306, -73.754311),
	new google.maps.LatLng(40.675219, -73.848724),
	new google.maps.LatLng(40.784465, -73.846149)
    ]
    var marker_0 = new google.maps.Marker({position:randomspawns[Math.floor(Math.random()*randomspawns.length)] ,map: map, title: "player"});
    //////////////////////
    //SETTING UP PATHING//
    //////////////////////


    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({preserveViewport:true,
				  clickable: false,
				  markerOptions: {visible: false}
				 });
    ////////////////////////
    //SETTING UP PLAYER(S)//
    ////////////////////////
    var players = [];
    players[0] = {marker: marker_0,
                  circle: 0,
		  path: {
		      origin : 0,
		      destination : 0,
		      travelMode: google.maps.TravelMode.DRIVING
		  } 
		 };
    players[0].circle = new google.maps.Circle(circleDrawer(map,players[0].marker.position,4000));
    

    var getDistance = function(x,y){
	//console.log(Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2)));
	return Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2));
    }



    ////////////////////////////
    //PREDICTING PLAYER'S PATH//
    ////////////////////////////
    var curdist = 0;
    var remdist = maxdist; // This is how much the player has left to move in the current turn.
    google.maps.event.addListener(map, "mousemove", function(e){
	players[0].path.origin = players[0].marker.position;
	players[0].path.destination = e.latLng;
	directionsService.route(players[0].path,function(result, status){
	    if (status == google.maps.DirectionsStatus.OK){
		curdist = result.routes[0].legs[0].distance.value;
		directionsDisplay.setDirections(result);
		directionsDisplay.setMap(map);
		document.getElementById("curdist").innerHTML = "Current Distance: " + curdist;
	    }
	    
	});
	
    });

    /////////////////////
    //MOVING THE PLAYER//
    /////////////////////
    google.maps.event.addListener(map, "rightclick", function(e) {

	lat = e.latLng.lat();
	lng = e.latLng.lng();
	
	if (upperbound>lat && lowerbound<lat && leftboundnosi<lng && rightbound>lng){
	    if (curdist <= remdist && $("#turn")[0].className == "button-success pure-button") { //tests movement left
		//tests water
		imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=32&size=1x1&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
		$(imageObj).load(function() {
		    var pos = findPos($("#map"));
		    
		    var c = $("#map")[0].getContext('2d');
		    var p = c.getImageData(0, 0, 1, 1).data;
		    if (!(p[0] > 169 && p[0] < 175 && p[1] > 199 && p[1] < 215 && p[2] > 249)){
			//actually placing the player
			remdist = remdist - curdist;
			document.getElementById("remdist").innerHTML = "Remaining Distance: " + remdist;			
			players[0].marker.position = new google.maps.LatLng(lat,lng);
			players[0].circle.setCenter(new google.maps.LatLng(lat,lng));
			players[0].marker.setMap(map); 
			players[0].circle.setMap(map);
		    }
		
		});  
	    }
	}
	
	else{
	    window.alert("YOU'RE OUTSIDE NEW YORK")
	}
    });

    ////////////////////////////
    //ADDITIONAL MAP VARIABLES//
    ////////////////////////////
    var NewYorkOutline = [
 	new google.maps.LatLng(lowerbound,leftboundnosi),
 	new google.maps.LatLng(upperbound,leftboundnosi),
 	new google.maps.LatLng(upperbound,rightbound),
 	new google.maps.LatLng(lowerbound,rightbound),
 	new google.maps.LatLng(lowerbound,leftboundnosi)
    ]

    var outline = new google.maps.Polyline({
    	path:NewYorkOutline,
    	geodesic:true,
    	strokeColor: '#0000FF',
    	strokeOpacity: 1.0,
    	strokeWeight:2
    })
    
    outline.setMap(map);


    

    ////////////////
    //PLAYER TURNS//
    ////////////////
    document.getElementsByName("turn")[0].addEventListener("click", function() {
	remdist = maxdist;
	document.getElementById("remdist").innerHTML = "Remaining Distance: " + remdist;
	this.className = "pure-button pure-button-disabled";
    });
    //////////
    //RESIZE//
    //////////
    $(window).resize(function(){
	google.maps.event.trigger(map,"resize");
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);

function gameCreate() {
    /*Old maps.html
    stateChange();
    createElement(0, "button");
    elements[0].value = "End Turn";
    elements[0].setAttribute("name", "turn");
    createElementAppendTextNode(1, "p", "Remaining Distance: 3000");
    elements[1].setAttribute("id", "remdist");
    createElementAppendTextNode(2, "p", "Current Distance: 0");
    elements[2].setAttribute("id", "curdist");
    createElement(3, "div");
    elements[3].setAttribute("id", "map-canvas");
    createElement(4, "canvas");
    elements[4].setAttribute("id", "map");
    elements[4].setAttribute("height", "600");
    elements[4].setAttribute("width", "600");
    chat(5);
    documentBodyAppendElements();
    initialize();*/
    stateChange();
    createElement(0, "div");
    elementSetAttributes(0, [["class", "pure-g"], ["style", "height: 100%; width: 100%;"]]);
    createElement(1, "div");
    elementSetAttributes(1, [["class", "pure-u-4-5"], ["style", "height: 100%; width: 80%;"]]);
    createElement(2, "div");
    elementSetAttributes(2, [["id", "map-canvas"]]);
    createElement(3, "canvas");
    elementSetAttributes(3, [["id", "map"], ["height", "1"], ["width", "1"]]);
    createElement(4, "div");
    elementSetAttributes(4, [["class", "pure-u-1-5"]]);
    chat(5);
    //createElement(6, "button");
    //elements[6].value = "End Turn";
    createElementAppendTextNode(11, "button", "End Turn");
    elementSetAttributes(11, [["name", "turn"], ["id", "turn"], ["class", "pure-button"]]);
    createElementAppendTextNode(12, "p", "Remaining Distance: 3000");
    elements[12].setAttribute("id", "remdist");
    createElementAppendTextNode(13, "p", "Current Distance: 0");
    elements[13].setAttribute("id", "curdist");
    appendChild(0, 1);
    appendChild(1, 2);
    appendChild(1, 3);
    appendChild(0, 4);
    appendChild(4, 5);
    appendChild(4, 6);
    appendChild(4, 7);
    appendChild(4, 8);
    appendChild(4, 9);
    appendChild(4, 10);
    appendChild(4, 11);
    appendChild(4, 12);
    appendChild(4, 13);
    documentBodyAppendElements([0]);
    initialize();
    //documentBodyAppendElements();
    /*stateChange();
    location.replace("maps.html");
    chat(0);
    documentBodyAppendElements();
    initialize();*/
}

login();//})(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console. 少名　針妙丸
