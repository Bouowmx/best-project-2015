
function circleDrawer(m,c,r){
    return {strokeColor:"FF0000",
            strikeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: "#FF0000",
            map: m,
            center: c,
            radius: r,
	    clickable: false
	   };
}
function initialize() {
    var map = new google.maps.Map(document.getElementById('map-canvas'), {center: {lat: 40.7819, lng: -73.8883}, zoom: 13});
    var marker_0 = new google.maps.Marker({position: new google.maps.LatLng(40.7819, -73.8883), map: map, title: "Player"});
    var players = [];
    players[0] = {marker: marker_0,
                  circle: 0
		 };
    players[0].circle = new google.maps.Circle(circleDrawer(map,players[0].marker.position,4000))
 
    var getDistance = function(x,y){
	console.log(Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2)));
	return Math.sqrt(Math.pow(x.lat() - y.lat(),2) + Math.pow(x.lng() - y.lng(),2));
    }
    google.maps.event.addListener(map, "rightclick", function(e) {
	if (getDistance(e.latLng,players[0].marker.position) < 0.04620858163331883){
	    players[0].marker.position = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
	    players[0].circle.setCenter(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()));
	    players[0].marker.setMap(map); //setMap will render the marker.
	    players[0].circle.setMap(map);
	}
    });
    
}
google.maps.event.addDomListener(window, 'load', initialize);
