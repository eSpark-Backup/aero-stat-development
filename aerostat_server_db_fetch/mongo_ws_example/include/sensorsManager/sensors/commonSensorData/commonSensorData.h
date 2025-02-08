#ifndef COMMON_SENSOR_DATA_TYPE
#define COMMON_SENSOR_DATA_TYPE

#include <math.h>
#include <string>
#include <sstream>
#include "sensorsManager/base/sensorBase.h"
#include "logger/log_file.h"

extern float normalizedAerostatHeading;

#define LOAD_CELL_REGISTER 0x9C40
#define ULTRASONIC_REGISTER 0x0101
#define PRESSURE_SENSOR_REGISTER 0x0004
#define WIND_DIRECTION_REGISTER  0x0001
#define WIND_SPEED_REGISTER  0x0002
#define WIND_TEMPERATURE_REGISTER  0x0004
#define WIND_HUMIDITY_REGISTER  0x0006
#define AIR_PRESSURE_REGISTER  0x0008
#define PRESSURE_SCALING_FACTOR 4.01463

#define TEMP_HUMIDITY_REGISTER 0x0001
#define HUMIDITY_REGISTER 0x0000

// AHRS/GPS register addresses
const uint16_t ROLL_REGISTER = 0x3D;
const uint16_t PITCH_REGISTER = 0x3E;
const uint16_t YAW_REGISTER = 0x3F;
const uint16_t LONL_REGISTER = 0x49;
const uint16_t LONH_REGISTER = 0x4A;
const uint16_t LATL_REGISTER = 0x4B;
const uint16_t LATH_REGISTER = 0x4C;
const uint16_t GPS_HEIGHT_REGISTER = 0x4D;
const uint16_t GPS_YAW_REGISTER = 0x4E;
const uint16_t GPS_VL_REGISTER = 0x4F;
const uint16_t GPS_VH_REGISTER = 0x50;
const uint16_t SVNUM_REGISTER = 0x55;
const uint16_t PDOP_REGISTER = 0x56;
const uint16_t HDOP_REGISTER = 0x57;
const uint16_t VDOP_REGISTER = 0x58;

struct RegisterInfoAHRS {
    uint16_t address;
    int count;
};

struct RegisterInfo {
    int address;
    int count;
    std::string data_type;
};

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
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2);  // Set precision to 2 decimal places

        // Format each value and add it to the map
        oss.str(""); oss.clear();  // Clear the stream
        oss << heading;
        data["heading"] = oss.str();

        oss.str(""); oss.clear();
        oss << barometricPressure;
        data["barometric_pressure"] = oss.str();

        oss.str(""); oss.clear();
        oss << airTemperature;
        data["air_temperature"] = oss.str();

        oss.str(""); oss.clear();
        oss << windAngle;
        data["wind_angle"] = oss.str();

        oss.str(""); oss.clear();
        oss << windSpeed;
        data["wind_speed"] = oss.str();

        data["connection_status"] = status;

        return data;
    }


    void print() const override {
        LOG_WARNING("heading: %f", heading);
        LOG_WARNING("barometric_pressure: %f", barometricPressure);
        LOG_WARNING("air_temperature: %f", airTemperature);
        LOG_WARNING("wind_angle: %f", windAngle);
        LOG_WARNING("wind_speed: %f", windSpeed);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

#define BALPRES_OFFSET 0
struct ballonetPressureData : public SensorData {
    std::string status;
    float pressure;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["bal_pressure"] = std::to_string(pressure);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("bal_pressure: %f", pressure);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

#define MAGHEADING_OFFSET 0
#define PITCH_OFFSET 1
#define ROLL_OFFSET 2
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
        data["connection_status"] = status;
        return data;
    }
    
    void print() const override {
        LOG_WARNING("magnitude_heading: %f", magheading);
        LOG_WARNING("pitch: %f", pitch);
        LOG_WARNING("roll: %f", roll);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

struct fanLightWriteData {
    bool fan_one;
    bool fan_two;
    bool strobe_light;
};

struct relayWriteData {
    bool relayStates[4];
};

#define TENSION 0
#define MAX_TENSION 1
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

#define HELPRES_OFFSET 0
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
    float tension;
    float maxTension = 0;
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

struct ahrsData : public SensorData {
    std::string status;
    float roll;
    float pitch;
    float yaw = NAN;
    float longitude;
    float latitude;
    float altitude;
    float heading;
    float ground_speed = NAN;
    float pdop = NAN;
    float hdop = NAN;
    float vdop = NAN;
    float position_accuracy = NAN;
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
        data["ballonet_height"] = std::to_string(height);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("ballonet_height: %f", height);
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

struct relayData : public SensorData {
    std::string status;
    bool relayStatusArr[4] = {0};
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["primary_blower_value"] = std::to_string(relayStatusArr[0]);
        data["secondary_blower_value"] = std::to_string(relayStatusArr[1]);
        data["strobe_lights_value"] = std::to_string(relayStatusArr[2]);
        data["payload_power_value"] = std::to_string(relayStatusArr[3]);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("primary_blower_value: %d", relayStatusArr[0]);
        LOG_WARNING("secondary_blower_value: %f", relayStatusArr[1]);
        LOG_WARNING("strobe_lights_value: %f", relayStatusArr[2]);
        LOG_WARNING("payload_power_value: %f", relayStatusArr[3]);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

struct fanLightData : public SensorData {
    std::string status;
    bool fan_one;
    bool fan_two;
    bool strobe_lights_value;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        data["fan_one"] = std::to_string(fan_one);
        data["fan_two"] = std::to_string(fan_two);
        data["strobe_lights_value"] = std::to_string(strobe_lights_value);
        data["connection_status"] = status;
        return data;
    }

    void print() const override {
        LOG_WARNING("fan_one: %d", fan_one);
        LOG_WARNING("fan_two: %f", fan_two);
        LOG_WARNING("strobe_lights_value: %f", strobe_lights_value);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};


struct weatherStationTcpData : public SensorData {
    std::string status;
    float humidity;
    float barometricPressure;
    float airTemperature;
    float windAngle;
    float windSpeed;
    uint8_t flag;

    std::map<std::string, std::string> toMap() const override {
        std::map<std::string, std::string> data;
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2);  // Set precision to 2 decimal places

        // Format each value and add it to the map
        oss.str(""); oss.clear();  // Clear the stream
        oss << humidity;
        data["humidity"] = oss.str();

        oss.str(""); oss.clear();
        oss << barometricPressure;
        data["barometric_pressure"] = oss.str();

        oss.str(""); oss.clear();
        oss << airTemperature;
        data["air_temperature"] = oss.str();

        oss.str(""); oss.clear();
        oss << windAngle;
        data["wind_angle"] = oss.str();

        oss.str(""); oss.clear();
        oss << windSpeed;
        data["wind_speed"] = oss.str();

        data["connection_status"] = status;

        return data;
    }


    json toJson() const {
        json data;

        data["humidity"] = std::to_string(humidity);
        data["barometric_pressure"] = std::to_string(barometricPressure);
        data["air_temperature"] = std::to_string(airTemperature);
        data["wind_angle"] = std::to_string(windAngle);
        data["wind_speed"] = std::to_string(windSpeed);

        return data;
    }

    void print() const override {
        LOG_WARNING("humidity: %f", humidity);
        LOG_WARNING("barometric_pressure: %f", barometricPressure);
        LOG_WARNING("air_temperature: %f", airTemperature);
        LOG_WARNING("wind_angle: %f", windAngle);
        LOG_WARNING("wind_speed: %f", windSpeed);
        LOG_WARNING("connection_status: %s", status.c_str());
    }
};

#endif //COMMON_SENSOR_DATA_TYPE