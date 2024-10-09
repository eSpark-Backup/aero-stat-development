from log_file import log_message

def e_box_sensor_data(nmea_data):
    parsed_data = {
        'InternalTemp': None,
        'fan1': None,
        'fan2': None,
        'strobe': None,
        'position': None,
    }
    m_msgStr = ""
    # Check if the packet starts with '@'
    if nmea_data.startswith('@'):
        data_list = nmea_data.strip().split(',')

        # Extract header
        header = data_list[0].strip()

        if header == "@A01":  # From E-Box sensor
            temp_str = data_list[1].strip()
            fan1_status = data_list[2].strip()
            fan2_status = data_list[3].strip()
            strobe_status = data_list[4].strip()
            position_status = data_list[5].strip()

            try:
                temp_value = float(temp_str)  # Convert temperature to float
                parsed_data['InternalTemp'] = temp_value
                parsed_data['fan1'] = fan1_status
                parsed_data['fan2'] = fan2_status
                parsed_data['strobe'] = strobe_status
                parsed_data['position'] = position_status
                m_msgStr += "Internal Temperature: " + temp_str + "\tFan 1 Status: " + fan1_status + "\tFan 2 Status: " + fan2_status + "\tStrobe Status: " + strobe_status + "\tPosition Status: " + position_status
            except ValueError:
                # Handle cases where conversion to float fails
                pass
    if len(m_msgStr) != 0:
        log_message(m_msgStr)

    # return parsed_data