#ifndef WEATHER_STATION_TCP_SENSOR_H
#define WEATHER_STATION_TCP_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/tcpConnectionManager.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"

#define HEADING_OFFSET 0
#define BAROPRES_OFFSET 1
#define AIRTEMP_OFFSET 2
#define WINDANGLE_OFFSET 3
#define WINDSPEED_OFFSET 4

class WeatherStationTcp : public Sensor {
public:
    WeatherStationTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<weatherStationData>();
    }


    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "weather_station_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<WeatherStationTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {
        
        std::string ipToConnect = this->connectionParams_.ip;

         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        std::string nmeaData = connectionMan.connect_to_port(stoi(this->connectionParams_.port), ipToConnect);
        if(nmeaData.empty())
        {
            // data->barometricPressure = 0;
            // data->airTemperature = 0;
            // data->heading = 0;
            // data->windAngle = 0;
            // data->windSpeed = 0;
            // data->status = "disconnected";
            return data;
        }
        data = std::make_unique<weatherStationData>(readWeatherSData(nmeaData));
        if(connectionMan.port_flag == false)
        {
            data->barometricPressure = 0;
            data->airTemperature = 0;
            data->heading = 0;
            data->windAngle = 0;
            data->windSpeed = 0;
            data->status = "disconnected";
        }
        else
        {
            data->status = "connected";
        }       

        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disHeading(0.0, 360.0);
        // std::uniform_real_distribution<> disPressure(900.0, 1100.0);
        // std::uniform_real_distribution<> disTemp(-30.0, 50.0);
        // std::uniform_real_distribution<> disWindAngle(0.0, 360.0);
        // std::uniform_real_distribution<> disWindSpeed(0.0, 50.0);

        // data->heading = disHeading(gen);
        // data->barometricPressure = disPressure(gen);
        // data->airTemperature = disTemp(gen);
        // data->windAngle = disWindAngle(gen);
        // data->windSpeed = disWindSpeed(gen);
        // data->status = "connected";

        return data;
    }

private:

    weatherStationData readWeatherSData(const std::string& nmeaData) const {
         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        weatherStationData parsedData;
        std::string m_msgStr;
        std::vector<std::string> msgsList;

        // Split NMEA data into lines based on the newline character
        std::istringstream nmeaStream(nmeaData);
        std::string line;
        while (std::getline(nmeaStream, line)) {
            msgsList.push_back(line);
        }

        for (const auto& msg : msgsList) {
            std::vector<std::string> msgData;
            std::istringstream msgStream(msg);
            std::string field;

            // Split each message by commas
            while (std::getline(msgStream, field, ',')) {
                msgData.push_back(field);
            }

            if (msgData.empty()) continue;
            const std::string& msgHeader = msgData[0];
            std::ostringstream oss;
            oss << std::fixed << std::setprecision(2);

            if (msgHeader == "$HCHDT") {
                if (msgData.size() > 1) {
                    float headingV;
                    try {
                        headingV = std::stod(msgData[1]);
                        if (!std::isnan(headingV)) {
                            parsedData.flag |= 1<< HEADING_OFFSET;
                            headingV = connectionMan.formatFloat(headingV);
                            parsedData.heading = headingV;
                            oss.str ("");
                            oss << std::fixed << std::setprecision(2) << headingV;
                            m_msgStr = "Aerostat Heading: " + oss.str() + "\t";
                        }
                    } catch (...) {}
                }
            } else if (msgHeader == "$WIMDA") {
                if (msgData.size() > 5) {
                    double baroPres, airTemp;
                    bool baroOk = false, airOk = false;

                    try {
                        baroPres = std::stod(msgData[1]);
                        baroOk = true;
                    } catch (...) {}

                    try {
                        airTemp = std::stod(msgData[5]);
                        airOk = true;
                    } catch (...) {}

                    if (baroOk && airOk) {
                        baroPres = connectionMan.formatFloat(baroPres);
                        airTemp = connectionMan.formatFloat(airTemp);
                        parsedData.flag |= 1<< BAROPRES_OFFSET;
                        parsedData.flag |= 1<< AIRTEMP_OFFSET;
                        parsedData.barometricPressure = baroPres;
                        parsedData.airTemperature = airTemp;

                        // Format to 2 decimal places
                        oss.str(""); // Clear the stream
                        oss << std::fixed << std::setprecision(2) << airTemp;
                        m_msgStr += "Air Temp: " + oss.str() + "\t";

                        oss.str(""); // Clear the stream for the next value
                        oss << std::fixed << std::setprecision(2) << baroPres;
                        m_msgStr += "Baro Pres: " + oss.str() + "\t";
                    }
                }
            } else if (msgHeader == "$WIMWV") {
                if (msgData.size() > 3) {
                    float windDirection, windSpeed;
                    bool dirOk = false, speedOk = false;

                    try {
                        windDirection = std::stod(msgData[1]);
                        dirOk = true;
                    } catch (...) {}

                    try {
                        windSpeed = std::stod(msgData[3]);
                        speedOk = true;
                    } catch (...) {}

                    if (dirOk && speedOk) {
                        windDirection = connectionMan.formatFloat(windDirection);
                        windSpeed = connectionMan.formatFloat(windSpeed);
                        parsedData.flag |= 1<< WINDANGLE_OFFSET;
                        parsedData.flag |= 1<< WINDSPEED_OFFSET;
                        parsedData.windAngle = windDirection;
                        parsedData.windSpeed = windSpeed;

                        // Format to 2 decimal places
                        oss.str(""); // Clear the stream
                        oss << std::fixed << std::setprecision(2) << windDirection;
                        m_msgStr += "Wind Angle: " + oss.str() + "\t";

                        oss.str(""); // Clear the stream for the next value
                        oss << std::fixed << std::setprecision(2) << windSpeed;
                        m_msgStr += "Wind Speed: " + oss.str() + "\t";
                    }
                }
            }
        }
        if (!m_msgStr.empty()) {
            log_message(m_msgStr);
            LOG_SUCCESS( "%s",m_msgStr.c_str());    
        }

        return parsedData;
    }
    std::string name_;
    std::string ip_;
    std::shared_ptr<weatherStationData> data;
};

#endif //WEATHER_STATION_TCP_SENSOR_H