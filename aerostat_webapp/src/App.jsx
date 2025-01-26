import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Phase1 from "./phase_1";
import { ThemeContext } from "./ThemeHandler";
import React from "react";
import useWebSocket from "react-use-websocket";
import Phase2 from "./phase_2";

export const WebSocketContext = createContext();

function App() {
  const { phase } = useContext(ThemeContext);
  const [pageLoads, setPageLoads] = useState(false)

  // Memoize the socket URL to prevent unnecessary reinitializations
  const socketUrl = useMemo(() => 'ws://localhost:9001', []);

  // WebSocket setup
  const { readyState, sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connection opened"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (event) => console.error("WebSocket error:", event),
  });

  useEffect(() => {
    if (!pageLoads) {
      sendJsonMessage({
        "method": "alfa.phase.settings.set",
        "phaseType": "tcp"
      })
      sendJsonMessage({
        "method": "alfa.braodcast.settings.set",
        "enable": false
      })
      setPageLoads(true)
    }
  }, [pageLoads])

  return (
    <WebSocketContext.Provider value={{ readyState, sendJsonMessage }}>
      {/* {phase === 1 ? <Phase1 /> : <Phase2 />} */}
      <Phase1 />
    </WebSocketContext.Provider>
  );
}

export default App;
