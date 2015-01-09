

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
	    clickable: true
	   };
}
function initialize() {

    var lowerbound = 40.53898024667195;
    var leftbound = -74.26071166992188;
    var rightbound = -73.71081975097656;
    var upperbound = 40.89275342420696;
    var leftboundnosi = -74.0423583984375;
    
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 8});


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
    google.maps.event.addListener(players[0].circle, "mousemove", function(e){
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
    google.maps.event.addListener(players[0].circle, "rightclick", function(e) {
	lat = e.latLng.lat();
	lng = e.latLng.lng();
	
	if (upperbound>lat && lowerbound<lat && leftboundnosi<lng && rightbound>lng){
	    if (curdist <= remdist) {
		remdist = remdist - curdist;
		document.getElementById("remdist").innerHTML = "Remaining Distance: " + remdist; // Update the remaining distance
		console.log(e.latLng.lat() + "," + e.latLng.lng());
		players[0].marker.position = new google.maps.LatLng(lat,lng);
		players[0].circle.setCenter(new google.maps.LatLng(lat,lng));
		players[0].marker.setMap(map); //setMap will render the marker.
		players[0].circle.setMap(map);
	    }
	}else{
	    console.log("OUTSIDE");
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
	document.getElementById("remdist").innerHTML = "Remaining Distance: " + remdist; // Update the remaining distance.
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);
