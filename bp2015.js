var elements = [];
var elementEventListeners = [];
var name = "";
var intervalRoomsGet = 0;
var intervalWait = 0;
var playersMax = 4;
var roomNumber = -1;
var state = "";
var websocket = new WebSocket("ws://bp2015.themafia.info:9090");
window.onbeforeunload = function(event) {websocket.send("close\x1c" + name);};
websocket.onclose = function(event) {console.log("WebSocket connection closed: " + event.code);};
websocket.onerror = function(event) {console.log("WebSocket error occurred.");};
websocket.onmessage = function(event) {
	console.log("received: \"" + event.data + "\"");
	if (state == "join") {
		if (event.data == "true") {
			roomCreate();
			//Hopefully this is it.
		} else {
			alert("Cannot join room.");
			rooms();
		}
	} else if (state == "login") {
		if (event.data == "true") {
			name = document.getElementById("name").value;
			rooms();
		} else {alert("Name already in use.");}
	} else if (state == "rooms") {
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
			var index = 7 + 4 * i;
			if (elements[index]) {elements[index + 2].replaceChild(document.createTextNode((rooms_[i].split("\x1e").length - 2) + "/" + playersMax), elements[index + 2].firstChild);}
			else {
				createElement(index, "tr");
				createElementAppendTextNode(index + 1, "td", rooms_[i].split("\x1e")[0]);
				appendChild(index, index + 1);
				createElementAppendTextNode(index + 2, "td", (rooms_[i].split("\x1e").length - 2) + "/" + playersMax);
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
		console.log(room);
		if (room == "ready") {
			clearInterval(intervalWait);
		    //Go to game
		    state = "ingame";
		}
		else {for (var i = 0; i < playersMax; i++) {elements[2 + i].replaceChild(document.createTextNode("Player " + (i + 1) + ": " + room[2 + i].split("\x1f")[0]), elements[2 + i].firstChild);}}
	} else if (state == "waitRoomNumber") {
		roomNumber = parseInt(event.data);
		roomCreate();
	} else if (state == "ingame") {
	    gameCreate();
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
	elementEventListeners[0] = function(event) {if (event.which == 13) {websocket.send("name\x1c" + document.getElementById("name").value);}};
	elementEventListeners[1] = function(event) {websocket.send("name\x1c" + document.getElementById("name").value);};
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
	websocket.send("wait\x1c" + roomNumber + "\x1d" + name);
	intervalWait = setInterval(function() {websocket.send("wait\x1c" + roomNumber + "\x1d" + name)}, 1000);
}

function roomJoin(event) {
	console.log("Join room " + elements[elements.indexOf(event.currentTarget) - 2].textContent);
	clearInterval(intervalRoomsGet);
	state = "join";
	//stateChange();
	websocket.send("join\x1c" + elements[elements.indexOf(event.currentTarget) - 2].textContent + "\x1d" + name);
}

function rooms() {
	state = "rooms";
	stateChange();
	createElementAppendTextNode(0, "div", "Welcome " + name);
	createElementAddEventListener(1, "input", "click", function(event) {
		state = "waitRoomNumber";
		clearInterval(intervalRoomsGet);
		stateChange();
		websocket.send("roomCreate\x1c");
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

// MAPS.JS ====================================================================
var maxdist = 3000 ;
function removemax(){
    maxdist = 90999090090909;
}
function readdmax(){
    maxdist = 3000;
}

function circleDrawer(m,c,r){
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
    removemax();
    var canvas = document.getElementById("map");
    var context = canvas.getContext('2d');
    
    var imageObj = new Image();
    imageObj.onload = function(){
	context.drawImage(imageObj,0,0);
    };
    imageObj.crossOrigin='http://maps.googleapis.com/crossdomain.xml';
    imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center=40.6772917298741,-73.89129638671875&zoom=13&size=600x600&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
    

    var lowerbound = 40.53898024667195;
    var leftbound = -74.26071166992188;
    var rightbound = -73.71081975097656;
    var upperbound = 40.89275342420696;
    var leftboundnosi = -74.0423583984375;
    
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 10});


    ///////////////////////////////////
    //THIS MAKES A RANDOM SPAWN POINT//
    ///////////////////////////////////
    var randlat = ((Math.random()*((upperbound - lowerbound)*100000000000000))/100000000000000)+lowerbound
    var randlng = ((Math.random()*((rightbound - leftboundnosi)*100000000000000))/100000000000000)+leftboundnosi
    var marker_0 = new google.maps.Marker({position: new google.maps.LatLng(randlat, randlng),map: map, title: "player"});
    /////////////////////////////
    //END OF RANDOM SPAWN POINT//
    /////////////////////////////


    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({preserveViewport:true,
				  clickable: false,
				  markerOptions: {visible: false}
				 });
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



    /////////////////////
    //MOVING THE PLAYER//
    /////////////////////
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
    google.maps.event.addListener(map, "rightclick", function(e) {

	lat = e.latLng.lat();
	lng = e.latLng.lng();
	
	//WATER IS 171,213,253
	

	
	if (upperbound>lat && lowerbound<lat && leftboundnosi<lng && rightbound>lng){
	    if (curdist <= remdist) {
		
		imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=32&size=600x600&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
		$(imageObj).load(function() {
		    var pos = findPos($("#map"));
		    var x = 300;
		    var y = 300;
		    var c = $("#map")[0].getContext('2d');
		    var p = c.getImageData(x, y, 1, 1).data;
		    if (!(p[0] > 169 && p[0] < 175 && p[1] > 199 && p[1] < 215 && p[2] > 249)){
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
    ////////////////////////
    //END OF MOVING PLAYER//
    ////////////////////////

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


    

    document.getElementsByName("turn")[0].addEventListener("click", function() {
	remdist = maxdist;
	document.getElementById("remdist").innerHTML = "Remaining Distance: " + remdist;
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);

function gameCreate() {
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
    documentBodyAppendElements();
    initialize();
}

login(); //Create a function that encloses the entire body and run it, so that nothing can be modified through the browser console.
