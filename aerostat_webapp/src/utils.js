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
    return result
  } catch (error) {
    console.log("Error in posting form2: ", error);
    return;
  }
};

export const updateToggle = async (toggleState) => {
  try {
    const response = await fetch(`http://localhost:5000/toggle-phase?toggle=${toggleState}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error in posting form: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in toggle: ", error);
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


export const getValueForKey = (key, data) => {
  const formatNumber = (value) => {
    if (isNaN(value) || value === null || value === undefined || value < 0) {
      return "0.00";
    }
    return parseFloat(value).toFixed(2);
  };

  switch (key) {
    case "Load Cell Tension:":
      return formatNumber(data?.port_data?.port_5005?.tension);
    case "Roll:":
      return formatNumber(data?.port_data?.port_5003?.roll);
    case "Wind Direction:":
      return formatNumber(data?.port_data?.port_5007?.wind_direction);
    case "Pitch:":
      return formatNumber(data?.port_data?.port_5003?.pitch);
    case "Wind Speed:":
      return formatNumber(data?.port_data?.port_5007?.wind_speed);
    case "Yaw:":
      return formatNumber(data?.port_data?.port_5003?.yaw);
    case "Temperature:":
      return formatNumber(data?.port_data?.port_5007?.air_temperature);
      case "Longitude:":
      return formatNumber(data?.port_data?.port_5003?.longitude);

    case "Humidity:":
      const humidityData = data?.port_data?.port_5007?.humidity;

      if (Array.isArray(humidityData) && humidityData.length > 0) {
        return formatNumber(humidityData[humidityData.length - 1]); // Get the last value in the array
      }

      return formatNumber(humidityData); // If it's a single value, return it formatted

    case "Latitude:":
      return formatNumber(data?.port_data?.port_5003?.latitude);
    case "Barometric Pressure:":
      return formatNumber(data?.port_data?.port_5001?.barometric_pressure);
    case "Altitude:":
      return formatNumber(data?.port_data?.port_5003?.altitude);
    case "Ballonet Curtain:":
      return formatNumber(data?.port_data?.port_5004?.ballonet_curtain);
    case "Position Accuracy":
      return formatNumber(data?.port_data?.port_5003?.position_accuracy);
    case "Ballonet Pressure:":
      return formatNumber(data?.port_data?.port_5002?.bal_pressure);
    case "Ground Speed:":
      return formatNumber(data?.port_data?.port_5003?.ground_speed);
    case "Hull Pressure:":
      return formatNumber(data?.port_data?.port_5001?.hull_pressure);
    case "Heading:":
      return formatNumber(data?.port_data?.port_5003?.heading);
    
    default:
      return "0.00";
  }
};


