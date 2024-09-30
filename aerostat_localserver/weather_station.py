def weatherstation_data(nmea_data):
    parsed_data = {
        'heading': None,
        'airTemp': None,
        'baroPres': None,
        'windAngle': None,
        'windSpeed': None,
    }

    # Split the input string into individual lines/messages
    msgs_list = nmea_data.strip().split('\n')

    for msg in msgs_list:
        msg_data = msg.split(',')
        msg_header = msg_data[0]

        if msg_header == "$HCHDT":
            h = msg_data[1]
            if len(h) > 0:
                heading_v = float(h)
                if not heading_v != heading_v:  # Check for NaN
                    parsed_data['heading'] = heading_v

        elif msg_header == "$WIMDA":
            baro_pres_str = msg_data[1]
            air_temp_str = msg_data[5]
            baro_pres = float(baro_pres_str)
            air_temp = float(air_temp_str)

            if not baro_pres != baro_pres and not air_temp != air_temp:  # Check for NaN
                parsed_data['baroPres'] = round(baro_pres * 10.0 + 0.5) / 10.0
                parsed_data['airTemp'] = air_temp

        elif msg_header == "$WIMWV":
            wind_direction_str = msg_data[1]
            wind_speed_str = msg_data[3]
            wind_direction = float(wind_direction_str)
            wind_speed = float(wind_speed_str)

            if not wind_direction != wind_direction and not wind_speed != wind_speed:  # Check for NaN
                parsed_data['windAngle'] = wind_direction
                parsed_data['windSpeed'] = wind_speed

    return parsed_data
