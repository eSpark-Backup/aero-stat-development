import { createContext, useContext } from "react";
import Phase1 from "./phase_1";
import Phase2 from "./phase_2";
import { ThemeContext } from "./ThemeHandler";
import React from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocketContext = createContext();

function App() {
  const { phase } = useContext(ThemeContext);
  const socketUrl = 'ws://localhost:9001';
  const { sendMessage, readyState, sendJsonMessage, onMessage, lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log('WebSocket connection opened'),
    onClose: () => console.log('WebSocket connection closed'),
    onError: (event) => console.error('WebSocket error:', event),
    onMessage: (message) => { },
  });

  return (
    <WebSocketContext.Provider value={{ sendMessage, readyState, sendJsonMessage, onMessage, lastMessage }}>
      {phase === 1 ? <Phase1 /> : <Phase2 />}
    </WebSocketContext.Provider>
  );
}

export default App;
