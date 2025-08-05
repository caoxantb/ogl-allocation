import { useAtomValue } from "jotai";
import { formData } from "../stores/form";

const Table = (props) => {
  const params = useAtomValue(formData);
  const { ogls, og } = props;
  const fam = Math.ceil(og / params.ogsPerFam);

  return (
    <div className="tables-wrapper">
      <div className="rotated-wrapper">
        <span className={`rotated-label rotated-label-${fam}`}>
          Fam {fam} • OG{og}
        </span>
      </div>
      <div className="rows-wrapper">
        {ogls.map((ogl) => (
          <div className="row" key={ogl.id}>
            <div className={`row-start-${fam}`}></div>
            <div className="row-id">{ogl.id}</div>
            <div className="row-gender">{ogl.gender}</div>
            <div className="row-name">{ogl.name}</div>
            <div className="row-bod">{ogl.birthday}</div>
            <div className="row-class">{ogl.class}</div>
            <div className="row-og">OG{og}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
