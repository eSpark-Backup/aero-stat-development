import { useContext } from "react";
import Phase1 from "./phase_1";
import Phase2 from "./phase_2";
import { ThemeContext } from "./ThemeHandler";

function App() {
  const { phase } = useContext(ThemeContext);
  return (
    <>
      {phase === 1 ? <Phase1 /> : <Phase2 />}
    </>
  );
}

export default App;
