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

struct ballonetPressureData : public SensorData {
    std::string status;
    float pressure;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["pressure"] = std::to_string(pressure);
        return data;
    }

    void print() const override {
        LOG_WARNING("pressure: %f", pressure);
    }
};

struct digitalCompassData : public SensorData {
    std::string status;
    float magheading;
    float pitch;
    float roll;
    uint8_t flag;

    // Convert ParsedData to string
    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["magnitude_heading"] = std::to_string(magheading);
        data["pitch"] = std::to_string(pitch);;
        data["roll"] = std::to_string(roll);
        return data;
    }
    
    void print() const override {
        LOG_WARNING("magnitude_heading: %f", magheading);
        LOG_WARNING("pitch: %f", pitch);
        LOG_WARNING("roll: %f", roll);
    }
};

struct adamSensorData : public SensorData {
    std::string status;
    float tension;
    float maxTension;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["tension"] = std::to_string(tension);
        data["max_tension"] = std::to_string(maxTension);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("tension: %f", tension);
        LOG_WARNING("max_tension: %f", maxTension);
    }
};

#endif //COMMON_SENSOR_DATA_TYPE