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

        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disroll(0.0, 300);
        // std::uniform_real_distribution<> dispitch(0.0, 300);
        // std::uniform_real_distribution<> disyaw(0.0, 300);
        // std::uniform_real_distribution<> dislongitude(0.0, 300);
        // std::uniform_real_distribution<> dislatitude(0.0, 300);
        // std::uniform_real_distribution<> disaltitude(0.0, 300);
        // std::uniform_real_distribution<> disheading(0.0, 300);
        // std::uniform_real_distribution<> disground_speed(0.0, 300);
        // std::uniform_real_distribution<> dispdop(0.0, 300);
        // std::uniform_real_distribution<> dishdop(0.0, 300);
        // std::uniform_real_distribution<> disvdop(0.0, 300);
        // std::uniform_real_distribution<> disposition_accuracy(0.0, 300);
        
        // // Assign random values to the fields
        // data->roll = disroll(gen);
        // data->pitch = dispitch(gen);
        // data->yaw = disyaw(gen);
        // data->longitude = dislongitude(gen);
        // data->latitude = dislatitude(gen);
        // data->altitude = disaltitude(gen);
        // data->heading = disheading(gen);
        // data->ground_speed = disground_speed(gen);
        // data->pdop = dispdop(gen);
        // data->hdop = dishdop(gen);
        // data->vdop = disvdop(gen);
        // data->position_accuracy = disposition_accuracy(gen);
        // data->status = "connected";
        // return data;
        if(!ahrs_client)
        {
            data->status = "disconnected";
            return data;
        }

        {
            ModbusConnectionManager connectionMan = ModbusConnectionManager::getInstance();
            std::map<std::string, uint16_t> mappedData;

            // Read the registers for AHRS GPS data
            for (const auto& [key, reg_info] : AHRS_GPS_REGISTERS) {
                uint16_t regs[1] = {0};
                if (!mb_ahrs->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
                    mappedData[key] = regs[0];
                } else {
                    std::cerr << "Error reading " << key << " register.\n";
                }
            }

            // Process the data and fill the ahrsData structure
            data->roll = (mappedData["roll"] / 32768.0f) * 180.0f;
            data->pitch = (mappedData["pitch"] / 32768.0f) * 180.0f;
            data->yaw = (mappedData["yaw"] / 32768.0f) * 180.0f;
            data->longitude = ((mappedData["LonH"] << 16) | mappedData["LonL"]) / 1000000.0f;
            data->latitude = ((mappedData["LatH"] << 16) | mappedData["LatL"]) / 1000000.0f;
            data->altitude = mappedData["GPSHeight"] / 10.0f;
            data->heading = mappedData["GPSYAW"] / 100.0f;
            data->ground_speed = ((mappedData["GPSVH"] << 16) | mappedData["GPSVL"]) * 0.01f;
            data->pdop = mappedData["PDOP"] / 100.0f;
            data->hdop = mappedData["HDOP"] / 100.0f;
            data->vdop = mappedData["VDOP"] / 100.0f;
            data->position_accuracy = connectionMan.calculate_position_accuracy(data->pdop, data->hdop, data->vdop);

            return data;
        }

    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<ahrsData> data;
    modbus* mb_ahrs;
    bool ahrs_client = false;
};

#endif //AHRS_MODBUS_SENSOR_H