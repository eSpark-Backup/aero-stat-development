import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Phase1 from "./phase_1";
import { ThemeContext } from "./ThemeHandler";
import React from "react";
import useWebSocket from "react-use-websocket";

export const WebSocketContext = createContext();

function App() {
  const { isPhase1Starts } = useContext(ThemeContext);
  const [pageLoads, setPageLoads] = useState(false);

  const socketUrl = useMemo(() => "ws://10.85.5.31:9001", []);

  // Use the useWebSocket hook in the App component
  const { readyState, sendJsonMessage, getWebSocket, lastMessage } =
    useWebSocket(socketUrl, {
      onOpen: () => console.log("WebSocket connection opened"),
      onClose: () => console.log("WebSocket connection closed"),
      onError: (event) => console.error("WebSocket error:", event),
    });

  useEffect(() => {
    console.log("IS PHASE: ", isPhase1Starts);
  }, [isPhase1Starts]);

  useEffect(() => {
    if (!pageLoads) {
      sendJsonMessage({
        method: "alfa.phase.settings.set",
        phaseType: "modbus",
      });
      sendJsonMessage({
        method: "alfa.braodcast.settings.set",
        enable: true,
      });
      setPageLoads(true);
    }
  }, [pageLoads, sendJsonMessage]);

  useEffect(() => {
    return () => {
      const ws = getWebSocket();
      if (ws) {
        ws.close(); // Close WebSocket on unmount
      }
    };
  }, [getWebSocket]);

  // Provide the WebSocket connection and lastMessage to the context
  const websocketValue = useMemo(
    () => ({ readyState, sendJsonMessage, lastMessage }),
    [readyState, sendJsonMessage, lastMessage]
  );

  return (
    <WebSocketContext.Provider value={websocketValue}>
      <Phase1 />
    </WebSocketContext.Provider>
  );
}

export default App;
