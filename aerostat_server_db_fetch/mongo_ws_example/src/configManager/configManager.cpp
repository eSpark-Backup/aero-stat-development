#include "configManager/configManager.h"


// // Example usage
// int main() {
//     ConfigManager configManager;

//     // Define example server configurations
//     ServerConfig config;
    
//     // Example TCP server
//     ServerSetting tcpServer1 = {
//         "tcp1", 
//         "192.168.2.1", 
//         {{"5002", "temperature"}, {"5003", "humidity"}}
//     };

//     ServerSetting tcpServer2 = {
//         "tcp2", 
//         "192.168.2.1", 
//         {{"5002", "temperature"}, {"5003", "humidity"}}
//     };

//     // Example Modbus server
//     ServerSetting modbusServer1 = {
//         "modbus1", 
//         "192.168.2.1", 
//         {{"5002", "temperature"}, {"5003", "humidity"}}
//     };

//     ServerSetting modbusServer2 = {
//         "modbus2", 
//         "192.168.2.1", 
//         {{"5002", "temperature"}, {"5003", "humidity"}}
//     };

//     // Populate the configuration
//     config.tcp = {tcpServer1, tcpServer2};
//     config.modbus = {modbusServer1, modbusServer2};

//     // Save the configuration to the manager
//     configManager.saveServerConfig(config);

//     // Report the current configuration
//     configManager.reportConfigs();

//     return 0;
// }
