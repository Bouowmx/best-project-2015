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
    imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center=40.6772917298741,-73.89129638671875&zoom=13&size=1x1&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
    
    var lowerbound = 40.53898024667195;
    var leftbound = -74.26071166992188;
    var rightbound = -73.71081975097656;
    var upperbound = 40.89275342420696;
    var leftboundnosi = -74.0423583984375;

    //////////////////////
    //SETTING UP THE MAP//
    //////////////////////
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 10});


    /////////////////////////////////
    //SETTING UP RANDOM SPAWN POINT//
    /////////////////////////////////
    var randlat = ((Math.random()*((upperbound - lowerbound)*100000000000000))/100000000000000)+lowerbound
    var randlng = ((Math.random()*((rightbound - leftboundnosi)*100000000000000))/100000000000000)+leftboundnosi
    var marker_0 = new google.maps.Marker({position: new google.maps.LatLng(randlat, randlng),map: map, title: "player"});

    //////////////////////
    //SETTING UP PATHING//
    //////////////////////
    
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({preserveViewport:true,
				  clickable: false,
				  markerOptions: {visible: false}
				 });
    var getDistance = function(x,y){
	//testing purposes
	return Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2));
    }
    
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
	
	if (upperbound>lat && lowerbound<lat && leftboundnosi<lng && rightbound>lng){ //tests the NY boundaries
	    if (curdist <= remdist && $("#turn")[0].className == "button-success pure-button") { //tests movement left
		//tests water
		imageObj.src ="https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=32&size=1x1&key=AIzaSyAYeVRIphkYn8LRtRn-i2rQo2lzdTVb7DE&style=feature:water|color:0xABCBFD";
		$(imageObj).load(function() {
		    var pos = findPos($("#map"));


		    var c = $("#map")[0].getContext('2d');
		    var p = c.getImageData(0, 0, 1, 1).data;
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
	this.className = "pure-button pure-button-disabled";
    });
    

    
    $(window).resize(function(){
	google.maps.event.trigger(map,"resize");
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);

