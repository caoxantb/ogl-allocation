import { useRef } from "react";
import Papa from "papaparse";
import { useAtom, useSetAtom } from "jotai";
import { oglData } from "../stores/data";
import { parseOGL } from "../allocate";
import { formData } from "../stores/form";

const Home = () => {
  const fileInputRef = useRef(null);
  const setOglData = useSetAtom(oglData);
  const [params, setParams] = useAtom(formData);

  const parseCSV = (text) => {
    const result = Papa.parse(text, { header: true });
    return result.data;
  };

  const handleFileChange = (e) => {
    const files = e.target.files;

    if (files && files[0]) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target.result;
        const rawOGL = parseCSV(text);
        const { fams, ogsPerFam } = params;

        const parsedOgl = parseOGL(rawOGL, parseInt(fams), parseInt(ogsPerFam));

        setParams({ fams: parseInt(fams), ogsPerFam: parseInt(ogsPerFam) });

        setOglData(parsedOgl);
      };

      reader.readAsText(files[0]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      alert("Unsupported file type, choose .csv file only");
    }
  };

  const handleInputChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  return (
    <div className="centered-wrapper">
      <div>
        <img
          width="400"
          src="https://scontent-hel3-1.xx.fbcdn.net/v/t39.30808-6/518272442_122098130786938290_5781479697959492907_n.jpg?_nc_cat=103&cb=99be929b-ca288af0&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Z6MZ22jCKDUQ7kNvwHhke4f&_nc_oc=AdkDKoj4FYcjmA-gXAjyQgTnLs3HCh9bQWZQNjALSmEqFewrqxSMDdU5Oubrm0Yr700&_nc_zt=23&_nc_ht=scontent-hel3-1.xx&_nc_gid=4eGmfwtsrzkU8fe4eF1Esw&oh=00_AfUW9gCFP0Gldk8gScUwheA3TPihl94y0ik3h2Z_9NduiA&oe=6895BC52"
        />
      </div>
      <h1>OGLS ALLOCATION TOOL</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <input
          name="fams"
          type="text"
          placeholder="How many Fams?"
          onChange={handleInputChange}
        />
        <input
          name="ogsPerFam"
          type="text"
          placeholder="How many OGs per Fam?"
          onChange={handleInputChange}
        />
        <button
          style={{
            display: !Object.values(params).every((param) =>
              /^-?\d+$/.test(param)
            )
              ? "none"
              : "block",
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          UPLOAD CSV
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,text/csv"
            hidden
            onChange={handleFileChange}
          />
        </button>
      </div>
    </div>
  );
};

export default Home;
