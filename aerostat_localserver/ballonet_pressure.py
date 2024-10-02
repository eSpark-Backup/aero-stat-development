from log_file import log_message

def ballonet_data(nmea_data):
    parsed_data = {
        'BalPressure': None
    }
    m_msgStr = ""
    msgs_list = nmea_data.strip().split('=')
    if len(msgs_list) > 1:
        header = msgs_list[0].strip()

        if header == "#01CP":
            pressure = msgs_list[1].strip()  # Extract pressure value
            try:
                pressure_value = float(pressure)
                if pressure_value is not None:  # Check if pressure_value is not NaN
                    # Round to three decimal places
                    pressure_value = round(pressure_value, 3)
                    parsed_data['BalPressure'] = pressure_value
                    m_msgStr += "Ballonet Pressure: " + pressure
            except ValueError:
                # Handle cases where conversion to float fails
                pass
    if len(m_msgStr) != 0:
        log_message(m_msgStr)

    return parsed_data