#ifndef AHRS_MODBUS_SENSOR_H
#define AHRS_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"

float normalizedAerostatHeading = 0;

std::map<std::string, RegisterInfoAHRS> AHRS_GPS_REGISTERS = {
    {"roll", {ROLL_REGISTER, 1}},
    {"pitch", {PITCH_REGISTER, 1}},
    {"yaw", {YAW_REGISTER, 1}},
    {"LonL", {LONL_REGISTER, 1}},
    {"LonH", {LONH_REGISTER, 1}},
    {"LatL", {LATL_REGISTER, 1}},
    {"LatH", {LATH_REGISTER, 1}},
    {"GPSHeight", {GPS_HEIGHT_REGISTER, 1}},
    {"GPSYAW", {GPS_YAW_REGISTER, 1}},
    {"GPSVL", {GPS_VL_REGISTER, 1}},
    {"GPSVH", {GPS_VH_REGISTER, 1}},
    {"PDOP", {PDOP_REGISTER, 1}},
    {"HDOP", {HDOP_REGISTER, 1}},
    {"VDOP", {VDOP_REGISTER, 1}}
};

class AhrsMod : public Sensor {
public:
    AhrsMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<ahrsData>();
        mb_ahrs = new modbus(cp.ip, stoi(cp.port));
        ahrs_client = mb_ahrs->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ahrs_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<AhrsMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // if(!ahrs_client)
        // {
        //     data->status = "disconnected";
        //     return data;
        // }

        // {
        //     ModbusConnectionManager& connectionMan = ModbusConnectionManager::getInstance();
        //     std::map<std::string, uint16_t> mappedData;

        //     // Read the registers for AHRS GPS data
        //     for (const auto& [key, reg_info] : AHRS_GPS_REGISTERS) {
        //         uint16_t regs[1] = {0};
        //         if (!mb_ahrs->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
        //             mappedData[key] = regs[0];
        //         } else {
        //             std::cerr << "Error reading " << key << " register.\n";
        //         }
        //     }

        //     // Process the data and fill the ahrsData structure
        //     data->roll = (mappedData["roll"] / 32768.0f) * 180.0f;
        //     data->pitch = (mappedData["pitch"] / 32768.0f) * 180.0f;
        //     data->yaw = (mappedData["yaw"] / 32768.0f) * 180.0f;
        //     data->longitude = ((mappedData["LonH"] << 16) | mappedData["LonL"]) / 1000000.0f;
        //     data->latitude = ((mappedData["LatH"] << 16) | mappedData["LatL"]) / 1000000.0f;
        //     data->altitude = mappedData["GPSHeight"] / 10.0f;
        //     data->heading = mappedData["GPSYAW"] / 100.0f;
        //     data->ground_speed = ((mappedData["GPSVH"] << 16) | mappedData["GPSVL"]) * 0.01f;
        //     data->pdop = mappedData["PDOP"] / 100.0f;
        //     data->hdop = mappedData["HDOP"] / 100.0f;
        //     data->vdop = mappedData["VDOP"] / 100.0f;
        //     data->position_accuracy = connectionMan.calculate_position_accuracy(data->pdop, data->hdop, data->vdop);

            /*FETCHING INFORMAITON FROM MONGODB DIRECTLY*/
            cloudLogger& logger = cloudLogger::getInstance();
            std::vector<std::string> results = logger.cloudDb.query("ahrs_sensor_readings"); //pass collection name
            for (const auto& result : results) {
                LOG_SUCCESS("DATA = %s", result.c_str());

                json json_doc = nlohmann::json::parse(result);

                if (json_doc.contains("value")) {
                    json value = json_doc["value"];
                    
                    // Check if "roll" field exists
                    if (value.contains("roll") && value["roll"].contains("value")) {
                        float ahrsRollValue = value["roll"]["value"].get<float>();
                        LOG_DEBUG("AHRS Roll: %f", ahrsRollValue);
                        data->roll = ahrsRollValue;                    
                    } else if(value.contains("roll")) {
                        float ahrsRollValue = value["roll"].get<float>();
                        LOG_DEBUG("AHRS Roll: %f", ahrsRollValue);
                        data->roll = ahrsRollValue;
                    } else {
                        LOG_WARNING("Roll field is missing in the JSON");
                    }

                    // Check if "pitch" field exists
                    if (value.contains("pitch") && value["pitch"].contains("value")) {
                        float ahrsPitchValue = value["pitch"]["value"].get<float>();
                        LOG_DEBUG("AHRS Pitch: %f", ahrsPitchValue);
                        data->pitch = ahrsPitchValue;
                    } else if(value.contains("pitch")) {
                        float ahrsPitchValue = value["pitch"].get<float>();
                        LOG_DEBUG("AHRS Pitch: %f", ahrsPitchValue);
                        data->pitch = ahrsPitchValue;
                    } else {
                        LOG_WARNING("Pitch field is missing in the JSON");
                    }
                    float ahrsHeadingValue = 0;
                    // Check if "heading" field exists
                    if (value.contains("heading") && value["heading"].contains("value")) {
                        ahrsHeadingValue = value["heading"]["value"].get<float>();
                        LOG_DEBUG("AHRS Heading: %f", ahrsHeadingValue);
                    } else if(value.contains("heading")) {
                        ahrsHeadingValue = value["heading"].get<float>();
                        LOG_DEBUG("AHRS Heading: %f", ahrsHeadingValue);
                    } else {
                        LOG_WARNING("Heading field is missing in the JSON");
                    }

                    if(ahrsHeadingValue < 0)
                    {
                        data->heading = ahrsHeadingValue + 360.0f;
                        normalizedAerostatHeading = data->heading;
                    }
                    else 
                    {
                        data->heading = ahrsHeadingValue;
                        normalizedAerostatHeading = data->heading;
                    }

                    // Check if "latitude" field exists
                    if (value.contains("latitude") && value["latitude"].contains("value")) {
                        float ahrsLatValue = value["latitude"]["value"].get<float>();
                        LOG_DEBUG("AHRS Latitude: %f", ahrsLatValue);
                        data->latitude = ahrsLatValue;
                    } else if(value.contains("latitude")) {
                        float ahrsLatValue = value["latitude"].get<float>();
                        LOG_DEBUG("AHRS Latitude: %f", ahrsLatValue);
                        data->latitude = ahrsLatValue;
                    }else {
                        LOG_WARNING("Latitude field is missing in the JSON");
                    }

                    // Check if "longitude" field exists
                    if (value.contains("longitude") && value["longitude"].contains("value")) {
                        float ahrsLongValue = value["longitude"]["value"].get<float>();
                        LOG_DEBUG("AHRS Longitude: %f", ahrsLongValue);
                        data->longitude = ahrsLongValue;
                    } else if(value.contains("longitude")) {
                        float ahrsLongValue = value["longitude"].get<float>();
                        LOG_DEBUG("AHRS Longitude: %f", ahrsLongValue);
                        data->longitude = ahrsLongValue;
                    } else {
                        LOG_WARNING("Longitude field is missing in the JSON");
                    }

                    // Check if "altitude" field exists
                    if (value.contains("altitude") && value["altitude"].contains("value")) {
                        float ahrsAltValue = value["altitude"]["value"].get<float>();
                        LOG_DEBUG("AHRS Altitude: %f", ahrsAltValue);
                        data->altitude = ahrsAltValue;
                    } else if(value.contains("altitude")) {
                        float ahrsAltValue = value["altitude"].get<float>();
                        LOG_DEBUG("AHRS Altitude: %f", ahrsAltValue);
                        data->altitude = ahrsAltValue;
                    }else {
                        LOG_WARNING("Altitude field is missing in the JSON");
                    }
                } else {
                    LOG_ERROR("value field not found in the JSON");
                }
            }

            return data;
        // }

    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<ahrsData> data;
    modbus* mb_ahrs;
    bool ahrs_client = false;
};

#endif //AHRS_MODBUS_SENSOR_H