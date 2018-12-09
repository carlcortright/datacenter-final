mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybGNvcnRyaWdodCIsImEiOiJjaXp5bjZ6cjUwMnRiMnFsc3NtNXdzd2lrIn0.lOIK6KPugI4Ie1tI-iE2aQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 1.6,
    center: [2.479033561604979, 42.95746620796052],
});

// Get the geojson to display on the map
world_map = null;
var countries = []
$.getJSON("assets/data/world.geo.json", function(json) {
  world_map = json;
  for (i = 0; i < world_map.features.length; i++) {
    countries.push(world_map.features[i].id);
  }
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
          "fill-color": GREY,
          "fill-opacity": 0.6
      },
      "filter": ["==", 'id', id]
    });
  });
  var today = new Date();
  updateColors(today, map);
});


var dateDisplay = document.getElementById("date");
var today = new Date();
dateDisplay.innerHTML = today.toDateString();
var slider = document.getElementById("range");
slider.oninput = function() {
  // Get the date we are querying
  var start = new Date("5/1/2013").getMilliseconds();
  var range = Date.now() - start;
  var percent = range * (slider.value/slider.max) + start;
  var query = new Date(percent);
  
  // Display in the upper right
  dateDisplay.innerHTML = query.toDateString();
  updateColors(query, map);
}

function updateColors(date, map) {
  var sentiment = [];
  $.getJSON(SENTIMENT_ENDPOINT + '?year=' + date.getFullYear() + '&week=' + date.getWeek(), function(json) {
    sentiment = json.countries;
    for (const country in countries){
      if (sentiment.includes(country)) {
        var p = (sentiment[country] + 10) / 20;
        map.setPaintProperty(country, 'fill-color', blendColors(RED, GREEN, p));
      } else {
        map.setPaintProperty(country, 'fill-color', GREY);
      } 
    }
  });
}

