from log_file import log_message

def digital_compass(nmea_data):
    parsed_data = {
        'Magheading' :None,  
        'Pitch' : None,
        'Roll' : None,
    }
    m_msgStr = ""
    msgs_list = nmea_data.strip().split('\n')

    for msg in msgs_list:
        msg_data = msg.split(',')
        header = msg_data[0].strip()

        if header == "$PTNTHPR":
            h = msg_data[1].strip()  # Magnetic heading
            p = msg_data[3].strip()  # Pitch
            r = msg_data[5].strip()  # Roll

            try:
                heading_v = float(h)
                pitch_v = float(p)
                roll_v = float(r)

                if not any(v != v for v in (heading_v, pitch_v, roll_v)):  # Check for NaN
                    parsed_data['Magheading'] = heading_v
                    parsed_data['Pitch'] = pitch_v
                    parsed_data['Roll'] = roll_v
                    m_msgStr += "Mag Heading: " + h + "\tPitch: " + p + "\tRoll: " + r
            except ValueError:
                pass
    if len(m_msgStr) != 0:
        log_message(m_msgStr)

    return parsed_data