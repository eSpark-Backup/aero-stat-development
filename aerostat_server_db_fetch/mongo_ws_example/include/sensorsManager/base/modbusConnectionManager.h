#ifndef MODBUS_CONNECTION_MANAGER
#define MODBUS_CONNECTION_MANAGER

#include <string>
#include <cstring>
#include <map>

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
        uint32_t combined = (regs[0] << 16) | regs[1];
        return *reinterpret_cast<float*>(&combined);
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
};

#endif //MODBUS_CONNECTION_MANAGER