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
        adams: { MaxTension: 700, Tension: 10 },
        ballonet: { BalPressure: 0.071 },
        digitalCompass: { Magheading: 240.1, Pitch: 0, Roll: 0 },
        ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
        helium: { HelPressure: 0.398 },
        weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 },
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

                const numericValue = parseFloat(value);


                if (key === 'Pitch' || key === 'Roll') {
                    result.digitalCompass[key] = numericValue;
                }
                else if (key === 'MagHeading') {
                    result.digitalCompass['Magheading'] = numericValue;
                }
                else if (key === 'Ballonet Pressure') {
                    result.ballonet['BalPressure'] = numericValue;
                }
                else if (key === 'Helium Pressure') {
                    result.helium['HelPressure'] = numericValue;
                } else if (key === 'Aerostat Heading') {
                    result.weather['heading'] = numericValue;
                } else if (key === 'Wind Speed') {
                    result.weather['windSpeed'] = numericValue;
                } else if (key === 'Wind Angle') {
                    result.weather['windAngle'] = numericValue;
                } else if (key === 'Tension') {
                    result.adams['Tension'] = numericValue;
                }
                else if (key === 'Max Tension') {
                    result.adams['MaxTension'] = numericValue;
                }
                else if (key === 'Air Temp') {
                    result.weather['airTemp'] = numericValue;
                }
                else if (key === 'Baro Pres') {
                    result.weather['baroPres'] = numericValue;
                }
            });
        }
    });

    return result;
}

