import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;  // Initialize the socket outside of the component to prevent re-creation

// Utility for handling window width
export const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

export function calculateSkyLandPercentage(pitch) {
  if (pitch < -90) pitch = -90;
  if (pitch > 90) pitch = 90;

  const skyPercentage = 50 + (pitch / 145) * 100;

  const landPercentage = 100 - skyPercentage;

  return {
    sky: skyPercentage,
    land: landPercentage,
  };
}

// Initialize the socket only once
export const initializeSocket = () => {
  if (!socket) {
    socket = io('http://alfaops.local:5000', {
      autoConnect: false,  // Prevent auto connection
      reconnection: false  // Disable automatic reconnection
    });
  }
};

// Fetch data using Socket.IO
export const fetchDataUtil = (callback) => {
  if (!socket.connected) {
    socket.connect();  // Manually connect the socket if not connected
  }

  // socket.emit('get-port-data');
  socket.on('response', (data) => {
    console.log('Data received from server:', data);
    callback(data);
  });
};

// Update configuration using Socket.IO
export const updateConfigUtil = (form) => {
  if (!socket.connected) {
    socket.connect();  // Manually connect the socket if not connected
  }

  return new Promise((resolve, reject) => {
    socket.emit('update-config', form);

    socket.on('response', (data) => {
      resolve(data);
    });

    socket.on('error', (error) => {
      reject(error);
    });
  });
};

// Send device commands (Fans and Lights) using Socket.IO
export const sendDeviceCommands = (FansLight, callback) => {
  if (!socket.connected) {
    socket.connect();  // Manually connect the socket if not connected
  }

  socket.emit('send-device-commands', FansLight);

  socket.once('response', (data) => {
    if (callback) {
      callback(data);
    }
  });
};

// Disconnect function
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();  // Disconnect the socket
    console.log('Socket disconnected');
  }
};