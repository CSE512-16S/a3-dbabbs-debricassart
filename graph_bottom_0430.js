$(document).ready(function(){

      var width =  800;
      var height = 80;

  d3.csv('trips_seattle.csv', function(error, data) {

      var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
          18, 19, 20, 21, 22, 23];
      var dataset = Array(24).fill(0);

      data.forEach(function(d) {
        if (mode.indexOf(+d.mode) != -1) {
        //if (+d.mode in mode || 1==unlist(mode)) {
            dataset[+d.time_start_hhmm] += +d.count
        }
      });

      console.log(dataset)

      //console.log(dataset);

       var xScale = d3.scale.ordinal()
                   .domain(d3.range(dataset.length))
                   .rangeRoundBands([0, width], 0.05);

       var yScale = d3.scale.linear()
                   .domain([0, d3.max(dataset)])
                   .range([0, height]);

        var bar = d3.select("#barchart")
           .append("div")
           .classed("svg-container", true)
           .append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "0 0 800 100")
           .classed("svg-content-responsive", true);



       //Create bars
       bar.selectAll("rect")
          .data(dataset)
          .enter()
          .append("rect")
          //.filter(function(d) {return d.mode in mode})
            .attr("x", function(d, i) {
                  return xScale(i);
            })
            .attr("y", function(d) {
                  return height - yScale(d) - 13;
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
                return height ;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("fill", "teal");

    });

    function update_graph() {

        data.forEach(function(d) {
          if (mode.indexOf(+d.mode) != -1) {
          //if (+d.mode in mode || 1==unlist(mode)) {
              dataset[+d.time_start_hhmm] += +d.count
          }
        });

        var xScale = d3.scale.ordinal()
                   .domain(d3.range(dataset.length))
                   .rangeRoundBands([0, width], 0.05);

       var yScale = d3.scale.linear()
                   .domain([0, d3.max(dataset)])
                   .range([0, height]);

        var svg = d3.select("#barchart")
          .transition();

        svg.selectAll("rect")
          .attr("x", function(d, i) {
                  return xScale(i);
            })
            .attr("y", function(d) {
                  return height - yScale(d) - 13;
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

        bar.selectAll("text")
          .text(function(d) {
                return d;
          })
          .attr("text-anchor", "middle")
          .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
          })
          .attr("y", function(d) {
                return height ;
          })

    }

});