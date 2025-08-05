import "./App.css";

import Home from "./components/Home";
import Display from "./components/Display";
import { useAtomValue } from "jotai";
import { oglData } from "./stores/data";

function App() {
  const oglDataValue = useAtomValue(oglData);

  return !oglDataValue.length ? <Home /> : <Display />;
}

export default App;
