#ifndef WEATHER_STATION_TCP_SENSOR_H
#define WEATHER_STATION_TCP_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class WeatherStationTcp : public Sensor {
public:
    WeatherStationTcp(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "weather_station_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<WeatherStationTcp>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<weatherStationData>();

        LOG_DEBUG("%s", __FUNCTION__);

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

#endif //WEATHER_STATION_TCP_SENSOR_H