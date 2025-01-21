#ifndef COMMON_SENSOR_DATA_TYPE
#define COMMON_SENSOR_DATA_TYPE

#include "sensorsManager/base/sensorBase.h"

struct weatherStationData : public SensorData {
    std::string status;
    float heading;
    float barometricPressure;
    float airTemperature;
    float windAngle;
    float windSpeed;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["Heading"] = std::to_string(heading);
        data["Barometric Pressure"] = std::to_string(barometricPressure);
        data["Air Temperature"] = std::to_string(airTemperature);
        data["Wind Angle"] = std::to_string(windAngle);
        data["Wind Angle"] = std::to_string(windSpeed);
        return data;
    }

    void print() const override {
        LOG_WARNING("Heading: %f", heading);
        LOG_WARNING("Barometric Pressure: %f", barometricPressure);
        LOG_WARNING("Air Temperature: %f", airTemperature);
        LOG_WARNING("Wind Angle: %f", windAngle);
        LOG_WARNING("Wind Angle: %f", windSpeed);
    }
};

#endif //COMMON_SENSOR_DATA_TYPE