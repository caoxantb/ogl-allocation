import { useAtomValue } from "jotai";
import GlobalStats from "./GlobalStats";
import { oglData } from "../../stores/data";
import GroupedPieCharts from "./FamPieChart";
import GeneralStackedBarChart from "./OgBarChart";
import HeatmapComponent from "./OgHeatMap";

const Charts = () => {
  const oglDataValue = useAtomValue(oglData);

  return (
    <>
      <GlobalStats rawData={oglDataValue} />
      <GroupedPieCharts
        data={oglDataValue}
        groupByKey="fam"
        countKey="gender"
        titlePrefix="Gender"
        categoryOrder={["F", "M"]}
      />
      <GroupedPieCharts
        data={oglDataValue}
        groupByKey="fam"
        countKey="personality"
        titlePrefix="Personality"
        categoryOrder={["FC", "FS", "QT", "SN", "TC"]}
      />

      <GeneralStackedBarChart
        data={oglDataValue}
        groupByKey="og"
        stackKey="gender"
        title="Gender Distribution in Each OG"
      />
      <GeneralStackedBarChart
        data={oglDataValue}
        groupByKey="og"
        stackKey="personality"
        title="Personality Distribution in Each OG"
      />

      <HeatmapComponent oglData={oglDataValue} />
    </>
  );
};

export default Charts;
