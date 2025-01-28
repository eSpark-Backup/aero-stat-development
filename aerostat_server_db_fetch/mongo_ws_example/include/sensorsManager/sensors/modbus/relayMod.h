#ifndef RELAY_MODBUS_SENSOR_H
#define RELAY_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"

// Define relay button configurations
struct RelayConfig {
    std::string name;
    std::vector<int> relay_nums;
};

std::vector<RelayConfig> relay_configs = {
    {"primary_blower", {3}},
    {"secondary_blower", {5}},
    {"strobe_lights", {4, 6}},  // Controls both relays 4 and 6
    {"payload_power", {7}}
};

class RelayMod : public Sensor {
public:
    RelayMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<relayData>();
        dataToWrite = std::make_shared<relayWriteData>();
        mb_relay = new modbus(cp.ip, stoi(cp.port));
        relay_client = mb_relay->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "relay_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<RelayMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());

        // // For binary values [0, 1]
        // std::uniform_int_distribution<> disbinary(0, 1);

        // // Assign random binary values to the fields
        // data->primary_blower_value = disbinary(gen);
        // data->secondary_blower_value = disbinary(gen);
        // data->strobe_lights_value = disbinary(gen);
        // data->payload_power_value = disbinary(gen);
        if(!relay_client)
        {
            data->status = "disconnected";
            return data;
        }
        data->status = "connected";

        return data;
    }

    bool writeData(const std::shared_ptr<void>& dataRcv) override {
        // Implementation for writing data
        ModbusConnectionManager& modbus = ModbusConnectionManager::getInstance();
        if (dataRcv) {
            auto value = std::static_pointer_cast<relayWriteData>(dataRcv);
            // Write `value` to the sensor
            dataToWrite->relayStates[0] = value->relayStates[0];
            dataToWrite->relayStates[1] = value->relayStates[1];
            dataToWrite->relayStates[2] = value->relayStates[2];
            dataToWrite->relayStates[3] = value->relayStates[3];

            data->primary_blower_value = value->relayStates[0];
            data->secondary_blower_value = value->relayStates[1];
            data->strobe_lights_value = value->relayStates[2];
            data->payload_power_value = value->relayStates[3];

            for (const auto& config : relay_configs) {
                bool value = false;
                if (config.name == relay_configs[0].name) {
                    value = data->primary_blower_value;
                } else if (config.name == relay_configs[1].name) {
                    value = data->secondary_blower_value;
                } else if (config.name == relay_configs[2].name) {
                    value = data->strobe_lights_value;
                } else if (config.name == relay_configs[3].name) {
                    value = data->payload_power_value;
                }

                for (int relay_num : config.relay_nums) {
                    if (!modbus.write_coil(relay_num - 1, value, mb_relay)) {
                        std::cerr << "Failed to write to relay " << relay_num << " (" << config.name << ").\n";
                        return false;
                    }
                }
            }

            return true;
        }
        return false; // Indicate failure
    }    


private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<relayData> data;
    std::shared_ptr<relayWriteData> dataToWrite;
    modbus* mb_relay;
    bool relay_client = false;
};

#endif //RELAY_MODBUS_SENSOR_H