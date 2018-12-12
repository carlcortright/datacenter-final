
const settings = {
  data_endpoint: "https://us-central1-brave-design-222322.cloudfunctions.net/weekly",
  sentiment_epochs: [
    {
      start: new Date('Jan 1, 1979'),  // start of gdeltv1
      bounds: {
        min: -5.0,
        med: 5.0,
        max: 8.0
      }
    }, {
      start: new Date('Nov 15, 2012'),  // fixes weirdness
      bounds: {
        min: -7.0,
        med: 2.0,
        max: 5.0
      }
    }, {
      start: new Date('Feb 19, 2015'),  // start of gdeltv2
      bounds: {
        min: -10.0,
        med: -3.0,
        max: 5.0
      }
    }
  ],
  sentiment_colors: {
    min: "#FF0000",  // red
    med: "#fbec14",  // yellow
    max: "#00E800",  // green
    undef: "#808080",  // grey
  }
};


function sentiment_to_color(smt, bounds) {
  const smt_colors = settings.sentiment_colors;
  if (typeof smt === "undefined") return smt_colors.undef;

  let min = bounds.min, max = bounds.med;
  let min_col = smt_colors.min, max_col = smt_colors.med;
  if (smt >= max) {
    min = max;
    max = bounds.max;
    min_col = max_col;
    max_col = smt_colors.max;
  }

  pct = (Math.max(min, Math.min(smt, max)) - min) / (max - min);
  // console.log(bounds, pct);

  return blendColors(min_col, max_col, pct);
};


function get_sentiment_bounds(date) {
  let i = 1;
  for (; i < settings.sentiment_epochs.length; ++i) {
    if (date < settings.sentiment_epochs[i].start) break;
  }
  return settings.sentiment_epochs[i - 1].bounds;
}


// Reference https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function blendColors(c0, c1, p) {
  var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
  return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var millisecsInDay = 86400000;
  var week = Math.ceil((((this - onejan) /millisecsInDay) + onejan.getDay()+1)/7);
  if (week < 10) {
    week = "0" + week.toString()
  }
  return week
};
