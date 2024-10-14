from log_file import log_message

def ballonet_data(nmea_data):
    parsed_data = {
        'BalPressure': None
    }
    m_msgStr = ""
    
    # Split the data by \r to process each individual message
    packets = nmea_data.strip().split('\r')
    
    for packet in packets:
        msgs_list = packet.strip().split('=')
        if len(msgs_list) > 1:
            header = msgs_list[0].strip()

            if header == "#01CP":
                pressure = msgs_list[1].strip()  # Extract pressure value
                try:
                    pressure_value = float(pressure)
                    # Round to three decimal places
                    pressure_value = round(pressure_value, 3)
                    parsed_data['BalPressure'] = pressure_value
                    m_msgStr += "Ballonet Pressure: " + str(pressure_value) + "\n"
                except ValueError:
                    log_message(f"Error converting pressure value '{pressure}' to float.")
                    continue  # Skip to the next packet if conversion fails

    # Log the message if any data was parsed
    if m_msgStr:
        log_message(m_msgStr.strip())

    return parsed_data
