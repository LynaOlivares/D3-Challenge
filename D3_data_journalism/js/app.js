//  D3 Challenge - Data Journalism and D3
// Create interactive charts to show the results of lack of healthcare in US states.
// Data review are age, household income, poverty


var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 130,
  left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ****************************

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis])-1, 
      d3.max(healthData, d => d[chosenXAxis])])
    .range([0, chartWidth]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles text with a transition to
// new circles text

function renderCirclesText(circlesText, newXScale, chosenXaxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "proverty") {
    var label = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var label = "Age (Median)";
  }
  else {
    var label = "Household Income (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>Healthcare: ${d.healthcare}<br>${chosenXAxis}: ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//*****************************
// Import Data
//*****************************

d3.csv("D3_data_journalism/data/data.csv").then(function(healthData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.income = +data.income;
      data.age = +data.age;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(healthData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d.healthcare)])
      .range([chartHeight, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);
    
    // Step 5: Create Circles
    // ==============================
    // append initial circles
    var circlesGroup = chartGroup.selectAll("stateCircle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "pink")
      .attr("opacity", ".5");

    var circlesText = chartGroup.selectAll("stateText")
      .data(healthData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => (yLinearScale(d.healthcare) + 3))
      .text(d => d.abbr)  
      .attr("font-family", "sans_serif")
      .attr("font-size", "12px")
      .attr("fill", "purple")
      .attr("text-anchor", "middle");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");


    // Step 6: Initialize tool tip
    // ==============================
    //var toolTip = d3.tip()
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
    // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        circlesText = renderCirclesText(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  }).catch(function(error) {
    console.log(`Error function ${error}`);
  });
