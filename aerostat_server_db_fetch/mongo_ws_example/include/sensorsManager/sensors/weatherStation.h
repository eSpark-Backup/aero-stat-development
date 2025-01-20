#ifndef WEATHER_STATION_SENSOR_H
#define WEATHER_STATION_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "logger/trace_util.h"

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

class WeatherStation : public Sensor {
public:
    WeatherStation(const std::string& name) : name_(name) {}

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<weatherStationData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disHeading(0.0, 360.0);
        std::uniform_real_distribution<> disPressure(900.0, 1100.0);
        std::uniform_real_distribution<> disTemp(-30.0, 50.0);
        std::uniform_real_distribution<> disWindAngle(0.0, 360.0);
        std::uniform_real_distribution<> disWindSpeed(0.0, 50.0);
        
        // Assign random values to the fields
        data->heading = disHeading(gen);
        data->barometricPressure = disPressure(gen);
        data->airTemperature = disTemp(gen);
        data->windAngle = disWindAngle(gen);
        data->windSpeed = disWindSpeed(gen);

        return data;
    }

private:
    std::string name_;
};

#endif //WEATHER_STATION_SENSOR_H