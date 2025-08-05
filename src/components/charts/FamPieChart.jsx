import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#E5383B", // bold crimson
  "#16DB93", // vivid mint
  "#3A86FF", // electric blue
  "#D2196E", // vibrant fuchsia
  "#FF7F11", // bright tangerine
];

// Create labels with percent + count
const renderLabel = (total) => (entry) => {
  const pct = (entry.value / total) * 100;
  return `${pct.toFixed(1)}% (${entry.value})`;
};

// Generic pie chart for one group
const GroupPieChart = ({ title, data }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div style={{ width: "33%", textAlign: "center" }}>
      <h4>{title}</h4>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label={renderLabel(total)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

// Generalized main component
const GroupedPieCharts = ({
  data,
  groupByKey,
  countKey,
  titlePrefix,
  categoryOrder = [],
}) => {
  // Summarize data by groups and countKey
  const groupedData = useMemo(() => {
    const groups = {};

    data.forEach((item) => {
      const group = item[groupByKey];
      const cat = item[countKey];
      if (!groups[group]) groups[group] = {};
      groups[group][cat] = (groups[group][cat] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([group, counts]) => {
        // map into your fixed order, filling zeros if missing
        const pieData = categoryOrder.map((name) => ({
          name,
          value: counts[name] || 0,
        }));

        return { group, data: pieData };
      })
      .sort((a, b) => (a.group > b.group ? 1 : -1)); // sort fams
  }, [data, groupByKey, countKey, categoryOrder]);

  return (
    <div style={{ textAlign: "center", marginBottom: "100px" }}>
      <h2>{titlePrefix} Distribution by Fam</h2>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        {groupedData.map(({ group, data }) => (
          <GroupPieChart
            key={group}
            title={`${titlePrefix} in Fam ${group}`}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupedPieCharts;
