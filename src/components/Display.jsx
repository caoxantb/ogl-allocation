import * as XLSX from "xlsx";
import { useAtom } from "jotai";
import { oglData } from "../stores/data";
import Table from "./Table";
import { useState } from "react";
import Charts from "./charts/Charts";
import { formData } from "../stores/form";

const Display = () => {
  const [oglDataValue, setOglData] = useAtom(oglData);
  const [dataTabValue, setDataTab] = useState(true);
  const [params, setParams] = useAtom(formData);

  const unflattenedOglDataValue = oglDataValue.reduce(
    (acc, cur) => {
      acc[cur.og - 1].push(cur);
      return acc;
    },
    Array.from({ length: params.fams * params.ogsPerFam }, () => [])
  );

  const downloadXlsx = () => {
    // Convert JS object/array to worksheet
    const worksheet = XLSX.utils.json_to_sheet(oglDataValue);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate a binary string representation
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Create a Blob and trigger download
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTab = () => {
    setDataTab(!dataTabValue);
  };

  const cancel = () => {
    setOglData([]);
    setParams({
      fams: "",
      ogsPerFam: "",
    });
  };

  return (
    <>
      <div className="display-buttons">
        <button className="download-button" onClick={downloadXlsx}>
          DOWNLOAD AS .XLSX
        </button>
        <button className="view-stats-button" onClick={toggleTab}>
          {dataTabValue ? "VIEW STATS" : "VIEW DATA"}
        </button>
        <button className="cancel-button" onClick={cancel}>
          CANCEL
        </button>
      </div>
      <h1 className="display-title">OGLS 10+ 2025</h1>

      {dataTabValue ? (
        unflattenedOglDataValue.map((ogs, idx) => (
          <Table ogls={ogs} og={idx + 1} key={idx + 1} />
        ))
      ) : (
        <>
          <Charts />
        </>
      )}
    </>
  );
};

export default Display;
