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
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};


struct helliumPressureData : public SensorData {
    std::string status;
    float helliumPressure;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["hellium_pressure"] = std::to_string(helliumPressure);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("hellium_pressure: %f", helliumPressure);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

struct hullPressureData : public SensorData {
    std::string status;
    float hullPressure;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["hull_pressure"] = std::to_string(hullPressure);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("hull_pressure: %f", hullPressure);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

/* Load cell modbus sensor data struct */
struct loadcellData : public SensorData {
    std::string status;
    float weight;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["weight"] = std::to_string(weight);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("weight: %f", weight);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

struct ahrsData : public SensorData {
    std::string status;
    float roll;
    float pitch;
    float yaw;
    float longitude;
    float latitude;
    float altitude;
    float heading;
    float ground_speed;
    float pdop;
    float hdop;
    float vdop;
    float position_accuracy;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["roll"] = std::to_string(roll);
        data["pitch"] = std::to_string(pitch);
        data["yaw"] = std::to_string(yaw);
        data["longitude"] = std::to_string(longitude);
        data["latitude"] = std::to_string(latitude);
        data["altitude"] = std::to_string(altitude);
        data["heading"] = std::to_string(heading);
        data["ground_speed"] = std::to_string(ground_speed);
        data["pdop"] = std::to_string(pdop);
        data["hdop"] = std::to_string(hdop);
        data["vdop"] = std::to_string(vdop);
        data["position_accuracy"] = std::to_string(position_accuracy);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("roll = %f", roll);
        LOG_WARNING("pitch = %f", pitch);
        LOG_WARNING("yaw = %f", yaw);
        LOG_WARNING("longitude = %f", longitude);
        LOG_WARNING("latitude = %f", latitude);
        LOG_WARNING("altitude = %f", altitude);
        LOG_WARNING("heading = %f", heading);
        LOG_WARNING("ground_speed = %f", ground_speed);
        LOG_WARNING("pdop = %f", pdop);
        LOG_WARNING("hdop = %f", hdop);
        LOG_WARNING("vdop = %f", vdop);
        LOG_WARNING("position_accuracy = %f", position_accuracy);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};


struct ballonetCurtainData : public SensorData {
    std::string status;
    float height;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["height"] = std::to_string(height);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("height: %f", height);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

struct avionicsEnvData : public SensorData {
    std::string status;
    float temperature;
    float humidity;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["temperature"] = std::to_string(temperature);
        data["humidity"] = std::to_string(humidity);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("temperature: %f", temperature);
        LOG_WARNING("humidity: %f", humidity);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};


#endif //COMMON_SENSOR_DATA_TYPE