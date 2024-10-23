import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;


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


// export const initializeSocket = () => {
//   if (!socket) {
//     socket = io('http://alfaops.local:5000', {
//       autoConnect: false,
//       reconnection: false
//     });
//   }
// };


// export const fetchDataUtil = (callback) => {
//   if (!socket.connected) {
//     socket.connect();
//   }

//   socket.emit('get-port-data');
//   socket.on('response', (data) => {
//     console.log('Data received from server:', data);
//     callback(data);
//   });
// };
export const fetchDataUtil = async () => {
  try {
    const response = await fetch("http://localhost:5000/get-port-data");
    if (!response.ok) {
      throw new Error(`Error in getting data: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error in getting data:", error);
    return null;
  }
};



// export const updateConfigUtil = (form) => {
//   if (!socket.connected) {
//     socket.connect();
//   }

//   return new Promise((resolve, reject) => {
//     socket.emit('update-config', form);

//     socket.on('response', (data) => {
//       resolve(data);
//     });

//     socket.on('error', (error) => {
//       reject(error);
//     });
//   });
// };

export const updateConfigUtil = async (form) => {
  try {
    console.log("IN TRY")
    const response = await fetch("http://localhost:5000/update-config", {
      method: "POST",
      // mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });
    if (!response.ok) {
      throw new Error(`Error in posting form 1: ${response.status}`);
    }
    const result = await response.json()
    console.log(result)
    return result
  } catch (error) {
    console.log("Error in posting form2: ", error);
    return;
  }
};


// export const sendDeviceCommands = (FansLight, callback) => {
//   if (!socket.connected) {
//     socket.connect();
//   }

//   socket.emit('send-device-commands', FansLight);

//   socket.once('response', (data) => {
//     if (callback) {
//       callback(data);
//     }
//   });
// };
export const sendDeviceCommands = async (FansLight) => {
  try {
    const response = await fetch("http://localhost:5000/send-device-commands", {
      method: "POST",
      // mode: 'cors',
      headers: {
        'Content-Type': 'application/json'

      },
      body: JSON.stringify(FansLight)
    })
    if (!response.ok) {
      throw new Error(`Error in posting Fans Light: ${response.status}`);
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.log("Error in posting Fans Light:", error);
    return null;
  }
};


// export const disconnectSocket = () => {
//   if (socket && socket.connected) {
//     socket.disconnect();
//     console.log('Socket disconnected');
//   }
// };