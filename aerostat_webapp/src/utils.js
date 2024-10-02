import { useEffect, useState } from 'react';

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

// Fetching Data
export const fetchDataUtil = async () => {
  try {
    const response = await fetch('http://localhost:5000/get-port-data');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error in fetchDataUtil:', error);
    return {};
  }
};