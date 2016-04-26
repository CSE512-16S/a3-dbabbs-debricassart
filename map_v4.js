var geoJsonObject;

$(document).ready(function(){
     
    map = new L.Map('mapcanvas');
    
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		
    
    map.setView(new L.LatLng(47.619, -122.332),13);
    map.addLayer(osm);
    
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