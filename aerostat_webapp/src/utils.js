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

// weather Station Port:4002
export const weatherstationData = (buffer) => {
  let m_WXBytesRead = buffer.byteLength;
  let m_WXBuffer = new Uint8Array(buffer);
  let m_msgStr = "";
  let parsedData = {
    heading: null,
    airTemp: null,
    baroPres: null,
    windAngle: null,
    windSpeed: null,
  };

  if (m_WXBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = m_WXBytesRead - 1; i >= 0; i--) {
      if (m_WXBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 2;

    if (foundEnd && m_WXBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_WXBuffer[msgStartOffset] === 0x24) { // 0x24 is '$'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_WXBytesRead -= msgEndOffset;
        m_WXBuffer = m_WXBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_WXBuffer.slice(msgStartOffset, msgEndOffset);
        let msgsList = new TextDecoder().decode(datagram).split('\n');

        for (let i = 0; i < msgsList.length - 1; i++) {
          let msg = msgsList[i];
          let msgData = msg.split(',');
          let msgHeader = msgData[0];

          if (msgHeader === "$HCHDT") {
            let h = msgData[1];
            if (h.length > 0) {
              let headingV = parseFloat(h);
              if (!isNaN(headingV)) {
                parsedData.heading = headingV;
                m_msgStr += `Aerostat Heading: ${h}\t`;
              }
            }
          } else if (msgHeader === "$WIMDA") {
            let baroPresStr = msgData[1];
            let airTempStr = msgData[5];
            let baroPres = parseFloat(baroPresStr);
            let airTemp = parseFloat(airTempStr);

            if (!isNaN(baroPres) && !isNaN(airTemp)) {
              // baroPres = Math.floor(baroPres * 10.0 + 0.5) / 10.0;
              parsedData.baroPres = Math.floor(baroPres * 10.0 + 0.5) / 10.0;
              parsedData.airTemp = airTemp;
              m_msgStr += `Air Temp: ${airTemp}\tBaro Pres: ${baroPres}\t`;
            }
          } else if (msgHeader === "$WIMWV") {
            let windDirectionStr = msgData[1];
            let windSpeedStr = msgData[3];
            let windDirection = parseFloat(windDirectionStr);
            let windSpeed = parseFloat(windSpeedStr);

            if (!isNaN(windDirection) && !isNaN(windSpeed)) {
              parsedData.windAngle = windDirection;
              parsedData.windSpeed = windSpeed;
              m_msgStr += `Wind Angle: ${windDirection}\tWind Speed: ${windSpeed}\t`;
            }
          }
        }

        if (m_msgStr.length > 0) {
          // console.log("Log Messages:", m_msgStr);
        }

        m_WXBytesRead -= msgEndOffset;
        m_WXBuffer = m_WXBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};

// Digital Compass Port:4003
export const digitalCompassData = (buffer) => {
  let m_MagBytesRead = buffer.byteLength;
  let m_magBuffer = new Uint8Array(buffer);
  let m_msgStr = "";
  let parsedData = {
    Magheading: null,
    Pitch: null,
    Roll: null,
  };

  if (m_MagBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = m_MagBytesRead - 1; i >= 0; i--) {
      if (m_magBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 2;

    if (foundEnd && m_MagBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_magBuffer[msgStartOffset] === 0x24) { // 0x24 is '$'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_MagBytesRead -= msgEndOffset;
        m_magBuffer = m_magBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_magBuffer.slice(msgStartOffset, msgEndOffset);
        let datagramStr = new TextDecoder().decode(datagram);
        let data = datagramStr.split(',');
        let header = data[0].trim();

        if (header === "$PTNTHPR") {
          let h = data[1].trim();
          let p = data[3].trim();
          let r = data[5].trim();
          let headingV = parseFloat(h);
          let pitchV = parseFloat(p);
          let rollV = parseFloat(r);

          if (!isNaN(headingV) && !isNaN(pitchV) && !isNaN(rollV)) {
            parsedData.Magheading = headingV;
            parsedData.Pitch = pitchV;
            parsedData.Roll = rollV;
            m_msgStr = `MagHeading: ${h}\tPitch: ${p}\tRoll: ${r}`;
          }
        }

        m_MagBytesRead -= msgEndOffset;
        m_magBuffer = m_magBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};

// Ballonet Sensor Port:4004
export const ballonetSensorData = (buffer) => {
  let m_BalPreBytesRead = buffer.byteLength;
  let m_BalPreBuffer = new Uint8Array(buffer);
  let m_msgStr = "";
  let parsedData = {
    BalPressure: null,
  };

  if (m_BalPreBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = m_BalPreBytesRead - 1; i >= 0; i--) {
      if (m_BalPreBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 1;

    if (foundEnd && m_BalPreBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_BalPreBuffer[msgStartOffset] === 0x23) { // 0x23 is '#'
        // if (m_BalPreBuffer[msgStartOffset] === 0x3F) { // 0x3F is '?'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_BalPreBytesRead -= msgEndOffset;
        m_BalPreBuffer = m_BalPreBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_BalPreBuffer.slice(msgStartOffset, msgEndOffset);
        let datagramStr = new TextDecoder().decode(datagram);
        let dataList = datagramStr.split('=');

        if (dataList.length > 1) {
          let header = dataList[0].trim();

          if (header === "#01CP") {
          // if (header === "?01CP") {
            let pressure = dataList[1].trim();
            let pressureValue = parseFloat(pressure);

            if (!isNaN(pressureValue)) {
              pressureValue = Math.floor(pressureValue * 1000.0 + 0.5) / 1000.0;
              parsedData.BalPressure = pressureValue;
              m_msgStr = `Ballonet Pressure: ${pressure}`;
              // Log received message
              // console.log("Log Messages:", m_msgStr);
              // Update GUI
              // m_pGUI.updateBallonetPres(pressureValue); // Replace with actual GUI update method
              // m_pDataLog.LogMsgs(m_msgStr); // Replace with actual logging method
            }
          }
        }

        m_BalPreBytesRead -= msgEndOffset;
        m_BalPreBuffer = m_BalPreBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};

// Helium Sensor Port:4005
export const heliumSensorData = (buffer) => {
  let m_HelPreBytesRead = buffer.byteLength;
  let m_HelPreBuffer = new Uint8Array(buffer);
  let m_msgStr = "";
  let parsedData = {
    HelPressure: null,
  };

  if (m_HelPreBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = m_HelPreBytesRead - 1; i >= 0; i--) {
      if (m_HelPreBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 1;

    if (foundEnd && m_HelPreBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_HelPreBuffer[msgStartOffset] === 0x23) { // 0x23 is '#'
        // if (m_HelPreBuffer[msgStartOffset] === 0x3F) { // 0x3F is '?'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_HelPreBytesRead -= msgEndOffset;
        m_HelPreBuffer = m_HelPreBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_HelPreBuffer.slice(msgStartOffset, msgEndOffset);
        let datagramStr = new TextDecoder().decode(datagram);
        let dataList = datagramStr.split('=');

        if (dataList.length > 1) {
          let header = dataList[0].trim();
          
          if (header === "#01CP") {
          // if (header === "?01CP") {
            let pressure = dataList[1].trim();
            let pressureValue = parseFloat(pressure);

            if (!isNaN(pressureValue)) {
              pressureValue = Math.floor(pressureValue * 1000.0 + 0.5) / 1000.0;
              parsedData.HelPressure = pressureValue;
              m_msgStr = `Helium Pressure: ${pressure}`;
              // Log received message
              // console.log("Log Messages:", m_msgStr);
              // Update GUI
              // m_pGUI.updateHeliumPres(pressureValue); // Replace with actual GUI update method
              // m_pDataLog.LogMsgs(m_msgStr); // Replace with actual logging method
            }
          }
        }

        m_HelPreBytesRead -= msgEndOffset;
        m_HelPreBuffer = m_HelPreBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};

// ADAMS Port:4006
export const adamsData = (buffer) => {
  let m_ADAMBytesRead = buffer.byteLength;
  let m_ADAMBuffer = new Uint8Array(buffer);
  let m_dMaxTension = 0;
  let m_msgStr = "";
  let parsedData = {
    Tension: null,
    MaxTension: null,
  };

  if (m_ADAMBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = 0; i < m_ADAMBytesRead; i++) {
      if (m_ADAMBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 1;

    if (foundEnd && m_ADAMBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_ADAMBuffer[msgStartOffset] === 0x3E) { // 0x3E is '>'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_ADAMBytesRead -= msgEndOffset;
        m_ADAMBuffer = m_ADAMBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_ADAMBuffer.slice(msgStartOffset, msgEndOffset);
        let datagramStr = new TextDecoder().decode(datagram);
        let dataList = datagramStr.split('>');
        let tension = dataList[1].trim();

        let tensionValue = parseFloat(tension);
        if (!isNaN(tensionValue)) {
          tensionValue = (tensionValue * 271.0279) / 9.8;
          tensionValue = Math.floor(tensionValue * 10.0 + 0.5) / 10.0; // decimals = 1 digit

          if (tensionValue > m_dMaxTension) {
            m_dMaxTension = tensionValue;
          }
          parsedData.Tension = tensionValue;
          parsedData.MaxTension = m_dMaxTension;
          m_msgStr = `Tension: ${tensionValue}\tMax Tension: ${m_dMaxTension}`;
          // console.log("Log Messages:", m_msgStr);
          // Update GUI
          // m_pGUI.updateTension(tensionValue, m_dMaxTension); // Replace with actual GUI update method
          // m_pDataLog.LogMsgs(m_msgStr); // Replace with actual logging method
        }

        m_ADAMBytesRead -= msgEndOffset;
        m_ADAMBuffer = m_ADAMBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};

// EBox Port:4008
export const eBoxData = (buffer) => {
  let m_PDUBytesRead = buffer.byteLength;
  let m_PDUBuffer = new Uint8Array(buffer);
  let m_msgStr = "";
  let parsedData = {
    InternalTemp: null,
    fan1: null,
    fan2: null,
    strobe: null,
    position: null,
  };

  if (m_PDUBytesRead > 0) {
    let crOffset = 0;
    let msgEndOffset = 0;
    let foundEnd = false;

    for (let i = 0; i < m_PDUBytesRead; i++) {
      if (m_PDUBuffer[i] === 0x0D) { // 0x0D is '\r'
        crOffset = i;
        foundEnd = true;
        break;
      }
    }
    msgEndOffset = crOffset + 1;

    if (foundEnd && m_PDUBytesRead >= msgEndOffset) {
      let foundStart = false;
      let msgStartOffset = 0;

      while (msgStartOffset < (crOffset - 1)) {
        if (m_PDUBuffer[msgStartOffset] === 0x40) { // 0x40 is '@'
          foundStart = true;
          break;
        }
        msgStartOffset++;
      }

      if (!foundStart) {
        m_PDUBytesRead -= msgEndOffset;
        m_PDUBuffer = m_PDUBuffer.slice(msgEndOffset);
      } else {
        let msgSize = msgEndOffset - msgStartOffset;
        let datagram = m_PDUBuffer.slice(msgStartOffset, msgEndOffset);
        let datagramStr = new TextDecoder().decode(datagram);
        let dataList = datagramStr.split(',');
        let header = dataList[0].trim();

        if (header === "@A01") { // From E-Box sensor
          let temp = dataList[1].trim();
          let tempV = parseFloat(temp);
          let fan1Status = dataList[2].trim();
          let fan2Status = dataList[3].trim();
          let strobeStatus = dataList[4].trim();
          let positionStatus = dataList[5].trim();

          // console.log("Internal temperature:", temp, "__", !isNaN(tempV), "__", tempV);
          // console.log("fan1", fan1Status);
          // console.log("fan2", fan2Status);
          // console.log("strobe", strobeStatus);
          // console.log("position", positionStatus);

          if (!isNaN(tempV)) {
            parsedData.InternalTemp = tempV;
            parsedData.fan1 = fan1Status;
            parsedData.fan2 = fan2Status;
            parsedData.strobe = strobeStatus;
            parsedData.position = positionStatus;
            m_msgStr = `Internal temperature: ${temp}\tBlower1 Status: ${fan1Status}\tBlower2 Status: ${fan2Status}\tStrobe Light Status: ${strobeStatus}\tPosition Light Status: ${positionStatus}`;
          }
        }
        m_PDUBytesRead -= msgEndOffset;
        m_PDUBuffer = m_PDUBuffer.slice(msgEndOffset);
      }
    }
  }
  return parsedData;
};