mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybGNvcnRyaWdodCIsImEiOiJjaXp5bjZ6cjUwMnRiMnFsc3NtNXdzd2lrIn0.lOIK6KPugI4Ie1tI-iE2aQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 1.6,
    center: [2.479033561604979, 42.95746620796052],
    interactive: false
});

// Get the geojson to display on the map
world_map = null;
var countries = []
$.getJSON("assets/data/world.geo.json", function(json) {
  world_map = json;
  for (i = 0; i < world_map.features.length; i++) {
    countries.push(world_map.features[i].properties.id);
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
          "fill-color": settings.sentiment_colors.undef,
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
  start = settings.sentiment_epochs[0].start.getTime();
  var range = Date.now() - start;
  console.log(range);
  var query = new Date(start + range * (slider.value/slider.max));

  // Display in the upper right
  dateDisplay.innerHTML = query.toDateString();
  updateColors(query, map);
}


function updateColors(date, map) {
  var sentiment = [];
  bounds = get_sentiment_bounds(date);
  $.getJSON(settings.data_endpoint + '?year=' + date.getFullYear() + '&week=' + date.getWeek(), function(json) {
    sentiment = json.countries;
    for (var i = 0; i < countries.length; i++){
      var cty = countries[i];
      fill_color = sentiment_to_color(sentiment[cty], bounds);
      map.setPaintProperty(cty, 'fill-color', fill_color);
    }
  });
}
