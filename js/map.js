mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybGNvcnRyaWdodCIsImEiOiJjaXp5bjZ6cjUwMnRiMnFsc3NtNXdzd2lrIn0.lOIK6KPugI4Ie1tI-iE2aQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 1.6,
    center: [2.479033561604979, 42.95746620796052],
});

// Get the geojson to display on the map
world_map = null;
$.getJSON("assets/data/world.geo.json", function(json) {
  world_map = json;
});

// Load the geojson so we can start coloring
map.on("load", function() {
  map.addSource("countries", {
    "type": "geojson",
    "data": world_map
  });
  world_map.features.forEach((country) => {
    var id = country.properties.id;
    map.addLayer({
      "id": id,
      "type": "fill",
      "source": "countries",
      "paint": {
          "fill-color": blendColors(RED, GREEN, 0.5),
          "fill-opacity": 0.6
      },
      "filter": ["==", 'id', id]
    });
  });
  var today = new Date();
  updateColors(today.toISOString(), map);
});


var dateDisplay = document.getElementById("date");
var slider = document.getElementById("range");
slider.oninput = function() {
  // Get the date we are querying
  var percent = Date.now() * (slider.value/100);
  var query = new Date(percent);
  
  // Display in the upper right
  dateDisplay.innerHTML = query.toDateString();
  updateColors(query.toISOString(), map);
}



function updateColors(date, map) {
  var sentiment = [];
  $.getJSON(SENTIMENT_ENDPOINT + '?date=' + date, function(json) {
    sentiment = json.countries;
    for (const country in sentiment){
      map.setPaintProperty(country, 'fill-color', blendColors(RED, GREEN, sentiment[country]));
    }
  });
}

