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


export function processDataArray(dataArray, currentResult = null) {
    // If currentResult is provided, use it as the base; otherwise, initialize with default values
    let result = currentResult || {
        weather: {
            heading: 0,
            windSpeed: 0,
            windAngle: 0
        },
        digitalCompass: {
            MagHeading: 0,
            Pitch: 0,
            Roll: 0,
        },
        ballonet: {
            BalPressure: 0
        },
        helium: {
            HelPressure: 0
        },
        adams: {
            Tension: 0,
            MaxTension: 0
        },
        ebox: {}
    };

    dataArray?.forEach(line => {
        // Remove the date and time prefix using regex
        const cleanedLine = line.replace(/^\d{8}\s\d{2}:\d{2}:\d{2}\s*/, '');

        // Use regex to match key-value pairs in the format "key: value"
        const keyValuePairs = cleanedLine.match(/(\w+(?:\s+\w+)*):\s*(-?\d+(\.\d+)?)/g);

        if (keyValuePairs) {
            keyValuePairs.forEach(pair => {
                // Split the key and value based on ":"
                const [key, value] = pair.split(':').map(item => item.trim());
                // Convert the value to a number
                const numericValue = parseFloat(value);

                // Update only the keys found in the current line
                if (key === 'MagHeading' || key === 'Pitch' || key === 'Roll') {
                    result.digitalCompass[key] = numericValue;
                } else if (key === 'Ballonet Pressure') {
                    result.ballonet['BalPressure'] = numericValue;
                } else if (key === 'Helium Pressure') {
                    result.helium['HelPressure'] = numericValue;
                } else if (key === 'Aerostat Heading') {
                    result.weather['heading'] = numericValue;
                } else if (key === 'Wind Speed') {
                    result.weather['windSpeed'] = numericValue;
                } else if (key === 'Wind Angle') {
                    result.weather['windAngle'] = numericValue;
                } else if (key === 'Tension') {
                    result.adams['Tension'] = numericValue;
                } else if (key === 'Max Tension') {
                    result.adams['MaxTension'] = numericValue;
                }
            });
        }
    });

    return result;
}







