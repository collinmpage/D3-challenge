// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale upon click 
function xScale(CSVdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(CSVdata, d => d[chosenXAxis]) * 0.8,
      d3.max(CSVdata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

  

// function used for updating circles labels group
function renderCircleLabels(circleLabelsGroup, newXScale, chosenXAxis) {

    circleLabelsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return circleLabelsGroup;
  }

  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var xlabel;
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Median age: "
    }
    else {
      xlabel = "Median Household Income: ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>Obesity: ${d.obesity}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
d3.csv("/data/data.csv").then(function(CSVdata) {
    // parse data
    CSVdata.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(CSVdata, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(CSVdata, d => d.obesity)])
      .range([height, 0]);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(CSVdata)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 15)
      .attr("fill", "lightblue")
      .attr("opacity", ".75");

// Add state abbreviations to cirlces
var circleLabelsGroup = chartGroup.append("g").selectAll("text")
.data(CSVdata)
.enter()
.append("text")
.attr("x", d => xLinearScale(d[chosenXAxis]) - 7.5)
.attr("y", d => yLinearScale(d.obesity) + 3.5)
.text(d => d.abbr)
.attr("font-size", "10px")
.attr("color", "black");



});