"use client";
import { useEffect } from "react";
import Plotly from "plotly.js-dist";

const ColoredYAxisPlot = ({ xPoints, yPoints }) => {
  const opacity = 1;
  const color = "rgba(61, 2, 2, 1)";
  const baseColor = "rgba(244, 225, 100, 1)";

  useEffect(() => {
    // Find the index of the maximum yPoint
    let maxY = Math.max(...yPoints);
    let maxIndices = [];

    // Collect all indices with the maximum yPoint value
    yPoints.forEach((y, i) => {
      if (y === maxY) {
        maxIndices.push(i);
      }
    });

    // Select the index with the largest xPoint value
    let maxIndex = maxIndices.reduce((a, b) =>
      xPoints[a] > xPoints[b] ? a : b
    );

    const traceGlow = {
      x: xPoints,
      y: yPoints,
      mode: "lines+markers",
      type: "scatter",
      marker: {
        size: 4, // Larger marker size for the glow effect
        color: color,
        opacity: 0.1, // Lower opacity for the outer glow
      },
      line: {
        color: color,
        width: 4, // Thicker line for the glow effect
        opacity: 0.1, // Lower opacity for the outer glow
      },
      hoverinfo: "skip",
      showlegend: false,
    };

    const trace1 = {
      x: xPoints,
      y: yPoints,
      mode: "lines+markers", // This will join the points with lines
      type: "scatter",
      marker: {
        size: 2,
        color: baseColor,
      },
      line: {
        color: baseColor,
        width: 3, // Slightly increase the width for bolder lines
      },
      hoverinfo: "x+y",
      showlegend: false,
    };

    const layout = {
      dragmode: "pan",
      title: "Problems Solved vs Rating Graph",
      xaxis: {
        zeroline: false, // Hide the x = 0 line
        showline: false, // Hide the axis border
        showgrid: false,
        title: "Number of Problems Solved", // Add x-axis label,
        //fixedrange : true
      },
      yaxis: {
        range: [0, Math.max(...yPoints) + 400],
        zeroline: false, // Hide the y = 0 line
        showline: false, // Hide the axis border
        showgrid: false,
        title: "Rating", // Add y-axis label
        tickvals: [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000], // Custom tick values
        ticktext: [
          "1200",
          "1400",
          "1600",
          "1900",
          "2100",
          "2300",
          "2400",
          "2600",
          "3000",
        ], // Custom tick labels
        //fixedrange : true,
      },
      shapes: [
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 0,
          y1: 1199,
          fillcolor: "rgba(204,204,204,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 1200,
          y1: 1399,
          fillcolor: "rgba(119,255,119,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 1400,
          y1: 1599,
          fillcolor: "rgba(119,221,187,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 1600,
          y1: 1899,
          fillcolor: "rgba(170,170,255,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 1900,
          y1: 2099,
          fillcolor: "rgba(255,136,255,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 2100,
          y1: 2299,
          fillcolor: "rgba(255,204,136,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 2300,
          y1: 2399,
          fillcolor: "rgba(247,186,96,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 2400,
          y1: 2599,
          fillcolor: "rgba(255,119,119,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 2600,
          y1: 2999,
          fillcolor: "rgba(255,51,51,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
        {
          type: "rect",
          xref: "paper",
          x0: 0,
          x1: 1,
          yref: "y",
          y0: 3000,
          y1: 6000,
          fillcolor: "rgba(170,0,0,255)",
          opacity: opacity,
          line: {
            width: 0,
          },
          layer: "below",
        },
      ],
      annotations: [
        {
          x: xPoints[maxIndex],
          y: yPoints[maxIndex],
          xref: "x",
          yref: "y",
          text: `Max Rating: ${yPoints[maxIndex]}`,
          showarrow: true,
          arrowhead: 7,
          ax: -30, // Offset the arrow along the x-axis for a diagonal effect
          ay: -50, // Offset the arrow along the y-axis for a diagonal effect
          font: {
            color: baseColor,
            size: 12,
          },
          bgcolor: "rgba(0,0,0,0.6)", // More opaque background (60% opacity)
          bordercolor: "rgba(244, 225, 100, 0.8)", // More opaque border (80% opacity)
          borderwidth: 1,
        },
      ],
    };

    const config = {
      responsive: true, // Make the plot responsive
      displayModeBar: false, // Hide the mode bar
    };

    Plotly.newPlot("myDiv1", [traceGlow, trace1], layout, config); // Pass config as the third argument
  }, [xPoints, yPoints]);

  return (
    <div>
      <div id="myDiv1"></div>
      <p className="px-5 text-center">
        This graph shows the relationship between the number of problems solved
        and the rating achieved
      </p>
    </div>
  );
};

export default ColoredYAxisPlot;
