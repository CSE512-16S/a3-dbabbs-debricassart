$(document).ready(function(){

  map = new L.Map('mapcanvas', {zoomControl:false});

    var here = new L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
       attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>',
       subdomains: '1234',
       base: 'aerial',
       type: 'maptile',
       scheme: 'terrain.day',
       app_id: '4OSXs0XhUV9zKdoPwfkt',
       app_code: 'crSpfyqk8_qFpG8hnqNz-A',
       mapID: 'newest',
       maxZoom: 11,
       minZoom:11,
       language: 'eng',
       format: 'png8',
       size: '256'
    });
      map.setView(new L.LatLng(47.619, -122.332),11);
      map.addLayer(here);

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide");

    queue()
        .defer(d3.json, "tracts_seattle_v2.json")
        .defer(d3.csv, "trips_seattle_modified.csv")
        .await(ready);

    function ready(error, tracts_seattle_v2, trips_seattle_modified) {

        if (error) throw error;

        collection = topojson.feature(tracts_seattle_v2, tracts_seattle_v2.objects.stdin)

        var transform = d3.geo.transform({point: projectPoint}),
        	path = d3.geo.path().projection(transform);

        var mapFeatures = g.append('g')
              .attr('class', 'features');

        var tractById = d3.map();

        var tracts = mapFeatures.selectAll('g')
                .data(collection.features)
                .enter().append('g')
                  .attr('class',"tract")
                  .each(function(d) {
                    tractById.set(d.properties.GEOID10, d);
                          d.incoming = [];
                          d.outgoing = [];
                          var position = path.centroid(d);
                          d.x = position[0];
                          d.y = position[1];
                 });

        tracts.append("path")
              .attr("class","tract_cell")
              .attr("d",path);

        trips = trips_seattle_modified.filter(function(d) {return ((d.o_tract != d.d_tract) & (mode.indexOf(+d.mode) != -1) & (purpose.indexOf(+d.d_purpose)!= -1))})

        var trips_count = d3.nest()
            .key(function(d) { return d.o_tract; })
            .key(function(d) { return d.d_tract; })
            .rollup(function(trips) { return d3.sum(trips, function(d) {return d.count}) })
            .entries(trips);

        var max_weight = 0;

        trips_count
            .forEach(function(d) {
                    var source = tractById.get(d.key);
                    d.values.forEach(function(d) {
                      max_weight = Math.max(max_weight, d.values);
                      var target = tractById.get(d.key);
                      link = {source: source, target: target, weight: d.values};
                      source.incoming.push(link);
                      target.outgoing.push(link);
                    });
                  });

        var lineScale = d3.scale.linear()
          .domain([0, max_weight])
          .range([0.2, 20]);

        tracts.append("g")
                  .attr("class","tract_links")
                    .selectAll("line")
                    .data(function(d) {return d.outgoing})
                    .enter().append("line")
                      .attr("class","tract_link")
                      .attr("x1", function(d) { return d.source.x})
                      .attr("x2", function(d) { return d.target.x})
                      .attr("y1", function(d) { return d.source.y})
                      .attr("y2", function(d) { return d.target.y})
                      .attr("stroke","gray")
                      //.attr("stroke-width",'0.8');
                      .attr("stroke-width", function(d) {return lineScale(d.weight)});

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
          tracts.attr("d", path);
        }

        function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }

        function updateMap() {

          var tractById = d3.map();

          tracts.data(collection.features)
                .each(function(d) {
                      tractById.set(d.properties.GEOID10, d);
                            d.incoming = [];
                            d.outgoing = [];
                            var position = path.centroid(d);
                            d.x = position[0];
                            d.y = position[1];
                   });

          trips = trips_seattle_modified.filter(function(d) {return ((d.o_tract != d.d_tract) & (mode.indexOf(+d.mode) != -1) & (purpose.indexOf(+d.d_purpose)!= -1))})

          console.log(purpose);
          console.log(trips);

          var trips_count = d3.nest()
              .key(function(d) { return d.o_tract; })
              .key(function(d) { return d.d_tract; })
              .rollup(function(trips) { return d3.sum(trips, function(d) {return d.count}) })
              .entries(trips);

          var max_weight = 0;

          trips_count
              .forEach(function(d) {
                      var source = tractById.get(d.key);
                      d.values.forEach(function(d) {
                        max_weight = Math.max(max_weight, d.values);
                        var target = tractById.get(d.key);
                        link = {source: source, target: target, weight: d.values};
                        source.incoming.push(link);
                        target.outgoing.push(link);
                      });
                    });

          console.log(tracts);

          var lineScale = d3.scale.linear()
            .domain([0, max_weight])
            .range([0.2, 20]);

          tracts.selectAll("line")
                      .remove();

          tracts.append("g")
                  .attr("class","tract_links")
                    .selectAll("line")
                    .data(function(d) {return d.outgoing})
                    .enter().append("line")
                      .attr("class","tract_link")
                      .attr("x1", function(d) { return d.source.x})
                      .attr("x2", function(d) { return d.target.x})
                      .attr("y1", function(d) { return d.source.y})
                      .attr("y2", function(d) { return d.target.y})
                      .attr("stroke","gray")
                      .attr("stroke-width", function(d) {return lineScale(d.weight)});

        }

    var width = 775;
    var height = 100;
    var padding = 35;

    d3.csv('trips_seattle_modified.csv', function(error, data) {

      var hours = ["1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM",
   "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM",
   "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"];
        /*var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
            18, 19, 20, 21, 22, 23
        ];*/
        var dataset = Array(24).fill(0);

        data.forEach(function(d) {
            if (mode.indexOf(+d.mode) != -1) {
                dataset[+d.time_start_hhmm] += +d.count
            }
        });

        var xScale = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([0, width], 0.05);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataset)])
            .range([0, height]);

      var yScale_axis = d3.scale.linear()
         .domain([0, d3.max(dataset)])
         .range([height, 0]);

        var yAxis = d3.svg.axis()
                          .scale(yScale_axis)
                          .orient("left")
                          .ticks(5);

        var bar = d3.select("#barchart")
            .append("div")
            .classed("svg-container", true)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 800 100")
            .classed("svg-content-responsive", true);

        bar.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return xScale(i) + 30;
            })
            .attr("y", function(d) {
                return height - yScale(d) - 13;
            })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", "teal");

        bar.selectAll("text")
            .data(hours)
            .enter()
            .append("text")
            .text(function(d) {
                return d;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2 + 30;
            })
            .attr("y", function(d) {
                return height;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "teal");

       bar.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + padding + ",-14)")
          .attr("font-size", "10px")
          .call(yAxis);

    function updateBar() {

           dataset = Array(24).fill(0);

           data.forEach(function(d) {
              if ((mode.indexOf(+d.mode) != -1) & (purpose.indexOf(+d.d_purpose)!= -1)) {
                   dataset[+d.time_start_hhmm] += +d.count
              }
           });

          xScale = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([0, width], 0.05);

          yScale = d3.scale.linear()
            .domain([0, d3.max(dataset)])
            .range([0, height]);

          yScale_axis = d3.scale.linear()
             .domain([0, d3.max(dataset)])
             .range([height, 0]);

          yAxis = d3.svg.axis()
                          .scale(yScale_axis)
                          .orient("left")
                          .ticks(5);

          var svg = d3.select("#barchart")
              .transition();

           bar.selectAll("rect")
              .data(dataset)
              .attr("x", function(d, i) {
                   return xScale(i) + 30;
               })
              .attr("y", function(d) {
                   return height - yScale(d) - 13;
               })
              .attr("width", xScale.rangeBand())
              .attr("height", function(d) {
                return yScale(d);
              });

          bar.select(".axis")
              .call(yAxis);

    };

  d3.select('#mode_filter')
      .selectAll('input').on("change", function() {
        if (this.checked) {
          mode.push(+this.value)
        }
        else {
          mode.splice(mode.indexOf(+this.value),1)
        }
        updateBar();
        updateMap();
      })

    d3.select('#purpose_filter')
      .selectAll('input').on("change", function() {
        if (this.checked) {
          purpose.push(+this.value)
        }
        else {
          purpose.splice(purpose.indexOf(+this.value),1)
        }
        updateBar();
        updateMap();
      })

    });

  };
});
