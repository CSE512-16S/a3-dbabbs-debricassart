
var w =  800;
var h = 80;

var data_count = [57,28, 50, 78, 205,594,1640, 3012,3303, 2589,2545,2830,3174,
                 2838,3112,3761,4092,4217,3526,2591,1798,1063,537,246];

var hours = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM",
           "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
           "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

/*d3.csv("sample.csv", function(data) {
   data.forEach(function(d) {
      d.time_start_hhmm = +d.time_start_hhmm;
      d.mode = +d.mode;
      d.count = +d.count;
   })

   console.log(data[0]);
});*/

d3.csv("sample.csv", function(error, data) {
   data.forEach(function(d) {
      d.time_start_hhmm = +d.time_start_hhmm;
      d.mode = +d.mode;
      d.count = +d.count;
   })
   var bar_count = d3.nest()
      .key(function(d) { return d.time_start_hhmm; })
      .rollup(function(d) {
         return d3.sum(d, function(g) { return g.count; });
         }).entries(data);
   console.log(data[4]);
});

var xScale = d3.scale.ordinal()
               .domain(d3.range(data_count.length))
               .rangeRoundBands([0, w], 0.05);

var yScale = d3.scale.linear()
               .domain([0, d3.max(data_count)])
               .range([0, h]);

var bar = d3.select("#bar-graph")
           .append("div")
           .classed("svg-container", true)
           .append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "0 0 800 100")
           .classed("svg-content-responsive", true);

bar.selectAll("rect")
    .data(data_count)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
          return xScale(i);
    })
    .attr("y", function(d) {
          return h - yScale(d) - 13;
    })
    .attr("width", xScale.rangeBand())
    .attr("height", function(d) {
          return yScale(d);
    })
    .attr("fill", "teal")
     .on("mouseover", function(d) {
        d3.select(this).attr("r", 10).style("fill", "SlateGray");

     })
     .on("mouseout", function(d) {
        d3.select(this).attr("r", 5.5).style("fill", "teal");
     })
     .on("click", function(d) {
        if(d == 246) {
           alert("success");
        }
     });

bar.selectAll("text")
    .data(hours)
    .enter()
    .append("text")
    .text(function(d) {
          return d;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
          return xScale(i) + xScale.rangeBand() / 2;
    })
    .attr("y", function(d) {
          return h ;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "teal");





var geoJsonObject;

$(document).ready(function(){

    map = new L.Map('map');

    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    //var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
    var here = new L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
     attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>',
     subdomains: '1234',
     base: 'base',
     type: 'maptile',
     scheme: 'normal.traffic.day',
     app_id: '4OSXs0XhUV9zKdoPwfkt',
     app_code: 'crSpfyqk8_qFpG8hnqNz-A',
     mapID: 'newest',
     maxZoom: 20,
     language: 'eng',
     format: 'png8',
     size: '256'
  });
    map.setView(new L.LatLng(47.619, -122.332),11);
    map.addLayer(here);

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var tooltip = d3.select(map.getPanes().popupPane).append('div')
            .attr('class', 'hidden tooltip');

    d3.json("tracts_seattle.json", function(collection) {
      collection = topojson.feature(collection, collection.objects.stdin)

      var transform = d3.geo.transform({point: projectPoint}),
      	path = d3.geo.path().projection(transform);

      var feature = g.selectAll("path")
	      .data(collection.features)
	      .enter().append("path");

	 d3.selectAll("path")
		  //.each(function (d, i) {
		     //var centroid = path.centroid(d);
		     //console.log('Centroid at: ' + centroid[0] + ', ' + centroid[1]);
		    .on('mousemove', function(d) {
                    var mouse = d3.mouse(svg.node()).map(function(d) {
                        return parseInt(d);
                    });
                    var centroid = path.centroid(d);
                    console.log('Centroid at: ' + centroid[0] + ', ' + centroid[1]);

                  tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 15) +
                                'px; top:' + (mouse[1] - 35) + 'px')
                        .html('Centroid at: ' + centroid[0] + ', ' + centroid[1]);
                })

            .on('mouseout', function() {
                    tooltip.classed('hidden', true);
            });


      map.on("viewreset", reset);
      reset();

      function reset() {
        var bounds = path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];

        svg .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path);
      }

      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }

     //  d3.selectAll("#states path")
  			// .each(function (d, i) {
     // 		var centroid = path.centroid(d);
     // 		alert('Centroid at: ' + centroid[0] + ', ' + centroid[1]);
  			// });

    });

  });
