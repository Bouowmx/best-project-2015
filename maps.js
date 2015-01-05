
var lowerbound = 40.490826256468054;
var leftbound = -74.26071166992188;
var rightbound = -73.78074645996094;
var upperbound = 40.89275342420696;

function circleDrawer(m,c,r){
    return {strokeColor:"FF0000",
            strikeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: "#FF0000",
            map: m,
            center: c,
            radius: r,
	    clickable: true
	   };
}
function initialize() {
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 13});
    var marker_0 = new google.maps.Marker({position: new google.maps.LatLng(40.7819, -73.8883), map: map, title: "Player"});
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
    

    //NOT IN USE, WAS USEFUL; NO LONGER USEFUL
    //Keeping it for a while though. Might be useful
    var getDistance = function(x,y){
	//console.log(Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2)));
	return Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2));
    }

    
    google.maps.event.addListener(players[0].circle, "mousemove", function(e){
	
	    players[0].path.origin = players[0].marker.position;
	    players[0].path.destination = e.latLng;
	    directionsService.route(players[0].path,function(result, status){
		if (status == google.maps.DirectionsStatus.OK){
		    directionsDisplay.setDirections(result);
		    directionsDisplay.setMap(map);
		}
		
	    });
	
    });
    google.maps.event.addListener(players[0].circle, "rightclick", function(e) {
	lat = e.latLng.lat();
	lng = e.latLng.lng();
	if (upperbound>lat && lowerbound<lat && leftbound<lng && rightbound>lng){
	    console.log(e.latLng.lat() + "," + e.latLng.lng());
	    players[0].marker.position = new google.maps.LatLng(lat,lng);
	    players[0].circle.setCenter(new google.maps.LatLng(lat,lng));
	    players[0].marker.setMap(map); //setMap will render the marker.
	    players[0].circle.setMap(map);
	}else{
	    console.log("OUTSIDE");
	}
	
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);
