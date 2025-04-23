import React, { useEffect } from "react";
import Plotly from "plotly.js-dist";

const BarChart = ({ questionIndex, timeTaken }) => {
  useEffect(() => {
    var trace1 = {
      x: questionIndex,
      y: timeTaken,
      name: "Question Rating vs Time Taken",
      type: "bar",
    };

    var data = [trace1];

    var layout = {
      dragmode: "pan",
      title: "Question Rating vs Avg. Time Taken",
      xaxis: {
        title: "Question Rating",
        type: "category", // Set x-axis type to category
        //fixedrange: true,  // Disable zooming on x-axis
      },
      yaxis: {
        title: "Average Time Taken (Minutes)",
        //fixedrange: true, // Disable zooming on y-axis
      },
    };

    const config = {
      responsive: true, // Make the plot responsive
      displayModeBar: false, // Hide the mode bar
    };

    Plotly.newPlot("myDiv3", data, layout, config);
  }, [questionIndex, timeTaken]);

  return (
    <div>
      <div id="myDiv3"></div>
      <p className="p-5 text-center">
        This bar chart displays the average time taken to solve problems based
        on their rating (based on the last 20 contests; extended to the last 40 contests if sample size is small).
      </p>
    </div>
  );
};

export default BarChart;
