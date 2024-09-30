def ballonet_data(nmea_data):
    parsed_data = {
        'BalPressure': None
    }

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
            except ValueError:
                # Handle cases where conversion to float fails
                pass

    return parsed_data