export function processData(input) {
    // Split the input by line breaks to get each line of data
    const lines = input.split('\n');

    // Initialize an array to hold the processed data
    const result = [];

    // Iterate over each line
    lines.forEach(line => {
        // Trim whitespace from the line
        const trimmedLine = line.trim();

        // If the line is not empty, process it
        if (trimmedLine) {
            // Push the line into the result array
            result.push(trimmedLine);
        }
    });

    return result;
}


export function formatDateTime(dateString = new Date().toISOString()) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const dateObj = new Date(dateString);

    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = monthsOfYear[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${dayOfWeek}, ${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}


export function processDataArray(dataArray, currentResult = null) {

    let result = currentResult || {
        adams: { max_tension: 700, tension: 10 },
        ballonet: { bal_pressure: 0.071 },
        digitalCompass: { mag_heading: 240.1, pitch: 0, roll: 0 },
        ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
        helium: { hel_pressure: 0.398 },
        weather: { air_temp: 18.8, baro_presssure: 29.3, heading: 128, wind_angle: 158.4, wind_speed: 70 },
        time: ""
    };

    dataArray?.forEach(line => {
        const dateTimeMatch = line.match(/^\d{8}\s\d{2}:\d{2}:\d{2}/);

        if (dateTimeMatch) {
            const dateString = dateTimeMatch[0];
            const datePart = dateString.slice(0, 8);
            const timePart = dateString.slice(9);

            const formattedDate = `${datePart.slice(4, 8)}-${datePart.slice(2, 4)}-${datePart.slice(0, 2)}`;


            const dateTimeString = `${formattedDate} ${timePart}`;


            result.time = formatDateTime(dateTimeString);
        }


        const cleanedLine = line.replace(/^\d{8}\s\d{2}:\d{2}:\d{2}\s*/, '');


        const keyValuePairs = cleanedLine.match(/(\w+(?:\s+\w+)*):\s*(-?\d+(\.\d+)?)/g);

        if (keyValuePairs) {
            keyValuePairs.forEach(pair => {

                const [key, value] = pair.split(':').map(item => item.trim());

                const numericValue = parseFloat(value).toFixed(2);


                // if (key === 'Pitch' || key === 'Roll') {
                //     result.digitalCompass[key] = numericValue;
                // }
                if (key === "Pitch") {
                    result.digitalCompass["pitch"] = numericValue
                }
                else if (key === "Roll") {
                    result.digitalCompass["roll"] = numericValue
                }
                else if (key === 'MagHeading') {
                    result.digitalCompass['mag_heading'] = numericValue;
                }
                else if (key === 'Ballonet Pressure') {
                    result.ballonet['bal_pressure'] = numericValue;
                }
                else if (key === 'Helium Pressure') {
                    result.helium['hel_pressure'] = numericValue;
                } else if (key === 'Aerostat Heading') {
                    result.weather['heading'] = numericValue;
                } else if (key === 'Wind Speed') {
                    result.weather['wind_speed'] = numericValue;
                } else if (key === 'Wind Angle') {
                    result.weather['wind_angle'] = numericValue;
                } else if (key === 'Tension') {
                    result.adams['tension'] = numericValue;
                }
                else if (key === 'Max Tension') {
                    result.adams['max_tension'] = numericValue;
                }
                else if (key === 'Air Temp') {
                    result.weather['air_temp'] = numericValue;
                }
                else if (key === 'Baro Pres') {
                    result.weather['baro_presssure'] = numericValue;
                }
            });
        }
    });

    return result;
}

