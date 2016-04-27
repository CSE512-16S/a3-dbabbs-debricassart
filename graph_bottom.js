$(document).ready(function(){

// bar graph shit ----------------------------------------
       //Width and height
       var w = 800;
       var h = 100;

  d3.csv('trips_all.csv', function(error, data) {

      var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
          18, 19, 20, 21, 22, 23];
      var dataset = Array(24).fill(0);

      data.forEach(function(d) {
          dataset[+d.time_start_hhmm] += +d.count
      });

      console.log(dataset);


       // var dataset = [57,28, 50, 78, 205,594,1640, 3012,3303, 2589,2545,2830,3174,

       //                 2838,3112,3761,4092,4217,3526,2591,1798,1063,537,246];

       // var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
       // 18, 19, 20, 21, 22, 23];

       var xScale = d3.scale.ordinal()
                   .domain(d3.range(dataset.length))
                   .rangeRoundBands([0, w], 0.05);

       var yScale = d3.scale.linear()
                   .domain([0, d3.max(dataset)])
                   .range([0, h]);

       //Create SVG element
       var bar = d3.select("#bar-graph")
                .append("svg:svg")
                .attr("width", w)
                .attr("height", h);

       //Create bars
       bar.selectAll("rect")
          .data(dataset)
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
           });

       //Create labels
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

    });

});