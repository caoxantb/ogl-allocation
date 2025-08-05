import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#E5383B", // bold crimson
  "#16DB93", // vivid mint
  "#3A86FF", // electric blue
  "#D2196E", // vibrant fuchsia
  "#FF7F11", // bright tangerine
];

const renderLabel = (total) => (entry) => {
  const pct = (entry.value / total) * 100;
  return `${pct.toFixed(1)}% (${entry.value})`;
};

const DemographicPieChart = ({ title, data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>{title}</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={renderLabel(total)}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

const GlobalStats = ({ rawData }) => {
  const genderData = useMemo(() => summarize(rawData, "gender"), [rawData]);
  const personalityData = useMemo(
    () => summarize(rawData, "personality"),
    [rawData]
  );

  return (
    <div style={{ textAlign: "center", marginBottom: "100px" }}>
      <h2>OGLs Global Demographic Distribution</h2>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <DemographicPieChart title="Gender Distribution" data={genderData} />
        <DemographicPieChart
          title="Personality Distribution"
          data={personalityData}
        />
      </div>
    </div>
  );
};

// Utility function outside component
function summarize(dataArray, key) {
  const counts = {};
  for (const obj of dataArray) {
    const val = obj[key];
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default GlobalStats;
