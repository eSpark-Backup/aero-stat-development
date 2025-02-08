#ifndef MODBUS_CONNECTION_MANAGER
#define MODBUS_CONNECTION_MANAGER

#include <string>
#include <cstring>
#include <map>
#include "logger/logger.h"
#include "modbus_lib/modbus.h"

class ModbusConnectionManager {
    public:
    static ModbusConnectionManager& getInstance()
    {
        static ModbusConnectionManager connectionManagerInstance;
        return connectionManagerInstance;
    }
    float convert_to_float(uint16_t regs[2])
    {
        uint32_t combined_value = (static_cast<uint32_t>(regs[0]) & 0xFFFF) | (static_cast<uint32_t>(regs[1]) << 16);
        float result;
        std::memcpy(&result, &combined_value, sizeof(result));
        return result;
    }
    float calculate_position_accuracy(float pdop, float hdop, float vdop) 
    {
        const float min_dop = 1.0f;
        const float max_dop = 20.0f;

    #if defined WINDOWS
        float pdop_accuracy = max(0.0f, (min(100.0f, (100.0f - ((pdop - min_dop) / (max_dop - min_dop)) * 100.0f))));
        float hdop_accuracy = max(0.0f, min(100.0f, 100.0f - ((hdop - min_dop) / (max_dop - min_dop)) * 100.0f));
        float vdop_accuracy = max(0.0f, min(100.0f, 100.0f - ((vdop - min_dop) / (max_dop - min_dop)) * 100.0f));
        return min(pdop_accuracy, min(hdop_accuracy, vdop_accuracy));
    #else
        float pdop_accuracy = std::max(0.0f, (std::min(100.0f, (100.0f - ((pdop - min_dop) / (max_dop - min_dop)) * 100.0f))));
        float hdop_accuracy = std::max(0.0f, std::min(100.0f, 100.0f - ((hdop - min_dop) / (max_dop - min_dop)) * 100.0f));
        float vdop_accuracy = std::max(0.0f, std::min(100.0f, 100.0f - ((vdop - min_dop) / (max_dop - min_dop)) * 100.0f));
        return std::min(pdop_accuracy, std::min(hdop_accuracy, vdop_accuracy));
    #endif
    }
    bool write_coil(int coil_address, bool value, modbus* mb_ptr) {
        uint16_t coil_value = value ? 0xFF00 : 0x0000;  // Modbus protocol uses 0xFF00 for ON and 0x0000 for OFF
        if (mb_ptr->modbus_write_coil(coil_address, coil_value)) {
            // std::cerr << "Error writing to coil at address " << coil_address << ".\n";
            LOG_ERROR("Error writing to coil at address : %d", coil_address);
            return false;
        }
        return true;
    }

    bool read_coil(int coil_address, bool &value, modbus* mb_ptr) {
        bool coil_value = false;
        if (mb_ptr->modbus_read_coils(coil_address, 1, &coil_value)) {
            // std::cerr << "Error reading coil at address " << coil_address << ".\n";
            LOG_ERROR("Error reading to coil at address : %d", coil_address);
            return false;
        }
        value = coil_value;
        return true;
    }
};

#endif //MODBUS_CONNECTION_MANAGER