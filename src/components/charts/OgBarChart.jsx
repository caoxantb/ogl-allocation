import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#E5383B", // bold crimson
  "#16DB93", // vivid mint
  "#3A86FF", // electric blue
  "#D2196E", // vibrant fuchsia
  "#FF7F11", // bright tangerine
];

const GeneralStackedBarChart = ({ data, groupByKey, stackKey, title }) => {
  // Process data into chart-friendly format:
  // [{ groupByKey: 'fam1', category1: count, category2: count, ...}, ...]
  const chartData = useMemo(() => {
    const groups = {};
    const categories = new Set();

    data.forEach((item) => {
      const group = item[groupByKey];
      const category = item[stackKey];

      categories.add(category);

      if (!groups[group]) groups[group] = { [groupByKey]: group };
      groups[group][category] = (groups[group][category] || 0) + 1;
    });

    // Fill missing categories with 0 for each group
    const categoriesArr = Array.from(categories);
    return Object.values(groups)
      .map((groupObj) => {
        categoriesArr.forEach((cat) => {
          if (!(cat in groupObj)) groupObj[cat] = 0;
        });
        return groupObj;
      })
      .sort((a, b) => (a[groupByKey] > b[groupByKey] ? 1 : -1));
  }, [data, groupByKey, stackKey]);

  // Extract all categories to create Bars dynamically
  const categories = useMemo(() => {
    const cats = new Set();
    data.forEach((item) => cats.add(item[stackKey]));
    return Array.from(cats);
  }, [data, stackKey]);

  return (
    <div style={{ width: "100%", height: 600, marginBottom: "100px" }}>
      <h2 style={{ textAlign: "center" }}>{title}</h2>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={groupByKey} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10, 12]} />
          <Tooltip />
          <Legend />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GeneralStackedBarChart;
