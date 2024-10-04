import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://alfaops.local:5000');

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

// Fetch data using Socket.IO
export const fetchDataUtil = (callback) => {
  socket.emit('get-port-data');

  socket.on('response', (data) => {
    // console.log('Data received from server:', data);
    callback(data);
  });
};

// Update configuration using Socket.IO
export const updateConfigUtil = (form) => {
  socket.emit('update-config', form);

  return new Promise((resolve, reject) => {
    socket.on('response', (data) => {
      // console.log('Config update response:', data);
      resolve(data);  
    });
    
    socket.on('error', (error) => {
      console.error('Error updating config:', error);
      reject(error);
    });
  });
};

// Send device commands (Fans and Lights) using Socket.IO
export const sendDeviceCommands = (FansLight, callback) => {
  socket.emit('send-device-commands', FansLight);

  socket.once('response', (data) => {
    // console.log('Command response:', data);
    
    if (callback) {
      callback(data);
    }
  });
};