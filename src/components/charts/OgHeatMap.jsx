import React from "react";
import Chart from "react-apexcharts";

function buildHeatmapSeries(rawData) {
  const ogSet = new Set(rawData.map((d) => String(d.og)));
  const xaxis = Array.from(ogSet).sort((a, b) => Number(a) - Number(b));

  const counts = {};
  rawData.forEach(({ class: cls, og }) => {
    const c = String(cls),
      o = String(og);
    if (!counts[c]) counts[c] = {};
    counts[c][o] = (counts[c][o] || 0) + 1;
  });

  const series = Object.entries(counts).map(([cls, ogMap]) => ({
    name: cls,
    data: xaxis.map((o) => ({ x: o, y: ogMap[o] || 0 })),
  }));

  return { series, xaxis };
}

const HeatmapApex = ({ oglData }) => {
  const { series, xaxis } = buildHeatmapSeries(oglData);

  const options = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: true,
      style: { colors: ["#000"] },
    },
    colors: ["#FF6F91"], // fallback single-color palette
    plotOptions: {
      heatmap: {
        enableShades: false, // disable automatic shading
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#FFFFFF", name: "0" },
            { from: 1, to: 1, color: "#FF6F91", name: "1" },
          ],
        },
      },
    },
    xaxis: {
      categories: xaxis,
      title: { text: "OG" },
    },
    yaxis: {
      title: { text: "Class" },
    },
    title: {
      text: "Class vs OG Count Heatmap",
      align: "center",
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "700px",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Chart
        options={options}
        series={series}
        type="heatmap"
        height={650} // increase height
        width={1100} // increase width
      />
    </div>
  );
};

export default HeatmapApex;
