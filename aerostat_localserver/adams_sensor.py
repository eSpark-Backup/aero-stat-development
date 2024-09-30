def adams_sensor_data(nmea_data):
    parsed_data = {
        'Tension': None,
        'MaxTension': None,
    }
    
    # Initialize Max Tension
    max_tension = 0.0

    # Strip and check if the packet starts with '>'
    if nmea_data.startswith('>'):
        # Extract the tension value after '>'
        tension_str = nmea_data[1:].strip()  # Get everything after '>'
        
        try:
            tension_value = float(tension_str)  # Convert to float
            if tension_value is not None:  # Ensure tension_value is not NaN
                tension_value = (tension_value * 271.0279) / 9.8  # Apply conversion

                # Round to one decimal place
                tension_value = round(tension_value, 1)

                # Update Max Tension if the new tension is greater
                if tension_value > max_tension:
                    max_tension = tension_value
                
                # Assign values to the parsed_data dictionary
                parsed_data['Tension'] = tension_value
                parsed_data['MaxTension'] = max_tension

        except ValueError:
            # Handle cases where conversion to float fails
            pass

    return parsed_data