#include <map>
#include "util.h"
#include <string>
#include <vector>
#include <cstdlib>
#include "json.hpp"
#include "modbus_tcp.h"
#include <iostream>
#include "httplib.h"
#include "log_file.h"

#ifdef WINDOWS
#include <windows.h>
#include <stdexcept>
#include <winsock2.h>

std::map<int, SOCKET> sockets;

#else
#include <unistd.h>      
#include <arpa/inet.h>  
#include <sys/socket.h>  
#include <netinet/in.h>

#define SOCKET_ERROR -1
//#define INVALID_SOCKET -1
std::map<int, int> sockets;

#endif

#include "adams_sensor.h"
#include "weather_station.h"
#include "digital_compass.h"
#include "helium_pressure.h"
#include "ballonet_pressure.h"

using namespace std;
using json = nlohmann::json;

Modbus_TCP modbus;
bool phase = false;  // Global flag to toggle between raw TCP and Modbus data fetchers
std::map<int, bool> connection_status;
bool connect_flag =false;
bool port_flag =false;
bool connect_thread_flag =false;
std::string fans_command = "";
std::string lights_command = "";
std::string TENSION_REQ_MSG = "#01\r";
std::string host;
std::string modbus_host;
std::vector<int> ports;
int target_port = 4006;

std::unordered_map<std::string, std::string> state_4007 = {
    {"field1", "ON"},   // First field
    {"field2", "ON"},   // Second field
    {"field3", "OFF"},  // Third field
};

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

const int hull_pressure_port = 5001;
const int ballonet_pressure = 5002;
const int ahrs_port = 5003;
const int ultrasonic_port = 5004;
const int load_cell_port = 5005;
const int temp_humidity_port = 5006;
const int weather_station_port = 5007;
const int relay_port = 4196;

std::vector<int> modbus_ports = {hull_pressure_port, ballonet_pressure, ahrs_port, ultrasonic_port, load_cell_port, temp_humidity_port, weather_station_port, relay_port};

// Placeholder data structures for registers
// (These would be the real Modbus register addresses and corresponding data structures)

#define LOAD_CELL_REGISTER 0x9C40
#define ULTRASONIC_REGISTER 0x0101
#define WEATHER_STATION_PORT 5007
#define TEMP_HUMIDITY_TCP_PORT 5006
#define RELAY_PORT 4196

#define OFFSET(x)    1 << x

// Simulated data for fetching (raw TCP data simulation)
struct RawTcpData {
    int port;
    std::string data;
};

void continuous_port_connection();
void continuous_port_connection_modbus();
bool check_host_reachable(const std::string &ip_address);
std::string fetch_modbus_data(int port);
std::string connect_to_port(int port);

json final_json_response;
json json_data;
std::mutex port_data_mutex;
json json_data_modbus;
std::mutex modbus_json_mutex;

void continuous_port_connection_modbus() {
    while(1)
    {
        std::lock_guard<std::mutex> lock(modbus_json_mutex);

        // if (system_data_map.find("current_data") != system_data_map.end()) {
        if(modbus.is_connected()) {
            for(int port : modbus_ports)
            {
                switch(port){
                    case hull_pressure_port:
                    {
                        json hull_json;
                        hull_json["hull_pressure"] = modbus.read_pressure();
                        json_data_modbus["port_" + std::to_string(port)] = hull_json;
                        break;
                    }
                    case ballonet_pressure:
                    {
                        json ballonet_json;
                        ballonet_json["bal_pressure"] = modbus.read_pressure();
                        json_data_modbus["port_" + std::to_string(port)] = ballonet_json;
                        break;
                    }
                    case ahrs_port:
                    {
                        // Step 1: Get the AHRS GPS data using the read_ahrs_gps_data function
                        AhrsGpsData ahrs_data = modbus.read_ahrs_gps_data();

                        // Step 2: Create a json object to store the data
                        json ahrs_json;
                        ahrs_json["latitude"] = ahrs_data.latitude;
                        ahrs_json["longitude"] = ahrs_data.longitude;
                        ahrs_json["roll"] = ahrs_data.roll;
                        ahrs_json["pitch"] = ahrs_data.pitch;
                        ahrs_json["yaw"] = ahrs_data.yaw;
                        ahrs_json["altitude"] = ahrs_data.altitude;
                        ahrs_json["heading"] = ahrs_data.heading;
                        ahrs_json["ground_speed"] = ahrs_data.ground_speed;
                        ahrs_json["pdop"] = ahrs_data.pdop;
                        ahrs_json["hdop"] = ahrs_data.hdop;
                        ahrs_json["vdop"] = ahrs_data.vdop;
                        ahrs_json["position_accuracy"] = ahrs_data.position_accuracy;

                        // Step 3: Add the json data to the main json_data_modbus map
                        json_data_modbus["port_" + std::to_string(port)] = ahrs_json;

                        break;
                    }
                    case load_cell_port:
                    {

                        json load_cell_json;
                        load_cell_json["tension"] = modbus.read_load_cell();
                        json_data_modbus["port_" + std::to_string(port)] = load_cell_json;
                        break;
                    }
                    case ultrasonic_port:
                    {
                        json ultrasonic_json;
                        ultrasonic_json["ballonet_curtain"] = modbus.read_ultrasonic();
                        json_data_modbus["port_" + std::to_string(port)] = ultrasonic_json;
                        break;
                    }
                    case temp_humidity_port:
                    {
                        json temp_humidity_json;
                        TempHumidityData temp_humidity_data = modbus.read_temp_humidity_data();
                        temp_humidity_json["temperature"] = temp_humidity_data.temperature;
                        temp_humidity_json["humidity"] = temp_humidity_data.humidity;
                        json_data_modbus["port_" + std::to_string(port)] = temp_humidity_json;
                        break;
                    }
                    case weather_station_port: {
                        // Step 1: Fetch weather data from the station
                        auto weather_data = modbus.read_weather_station();  // Calling the function to get weather data

                        // Step 2: Create a JSON object and populate it with weather data
                        json weather_station_json;
                        for (const auto& [key, parameter] : weather_data) {
                            weather_station_json[key] = parameter.value;
                        }

                        // Step 3: Store the weather data in json_data_modbus under the current port
                        json_data_modbus["port_" + std::to_string(port)] = weather_station_json;

                        // Optional: Print the data (for debugging purposes)
                        for (const auto& [key, parameter] : weather_data) {
                            std::cout << key << ": " << parameter.value << " " << parameter.unit << "\n";
                        }

                        break;
                    }
                    case relay_port:
                    {
                        json relay_json;
                        for (const auto& config : relay_configs) {
                            for (int relay_num : config.relay_nums) {
                                // relay_json[config.name] = modbus.read_coil(relay_num - 1);
                                bool relay_value;
                                if (modbus.read_coil(relay_num - 1, relay_value)) {
                                    relay_json[config.name] = relay_value;
                                } else {
                                    std::cerr << "Failed to read relay " << relay_num << " (" << config.name << ").\n";
                                }
                            }
                        }
                        json_data_modbus["port_" + std::to_string(port)] = relay_json;
                        break;
                    }
                }
            }
        }
        else {
            std::cout << "Error: Telemetry data not found in system_data_map.\n";
        }
#ifdef WINDOWS        
        Sleep(200);
#else
        usleep(200 * 1000);
#endif 
    }
}

void continuous_port_connection() {
    WeatherStation ws;
    DigitalCompass dc;
    BalPressure bp;
    HelPressure hp;
    AdamsSensor as;

    while (connect_flag) {
        connect_thread_flag=true;
        for (int port : ports) {
            if (port >= 4002 && port <= 4006)
            {
                std::string data = connect_to_port(port);
                if (!data.empty()) {
                    std::lock_guard<std::mutex> lock(port_data_mutex);  // Thread-safe access to port_data
                        switch (port) {
                            case 4002: {
                            ParsedData ws_data = ws.readWeatherSData(data);
                            json weather_json;
                            ws_data.status = port_flag ? "connected" : "disconnected";
                            weather_json["connection_status"] = ws_data.status;
                            if(OFFSET(HEADING_OFFSET) & ws_data.flag)
                            {
                                weather_json["heading"] = ws_data.heading;
                            }
                            if(OFFSET(BAROPRES_OFFSET) & ws_data.flag)
                            {
                                weather_json["baro_presssure"] = ws_data.barometricPressure;
                            }
                            if(OFFSET(AIRTEMP_OFFSET) & ws_data.flag)
                            {
                                weather_json["air_temp"] = ws_data.airTemperature;
                            }
                            if(OFFSET(WINDANGLE_OFFSET) & ws_data.flag)
                            {
                                weather_json["wind_angle"] = ws_data.windAngle;
                            }
                            if(OFFSET(WINDSPEED_OFFSET) & ws_data.flag)
                            {
                                weather_json["wind_speed"] = ws_data.windSpeed;
                            }
                            
                            json_data["port_" + std::to_string(port)] = weather_json;
                            break;
                        }
                        case 4003: {
                            ParsedData_DC dc_data = dc.readDigitalCompassData(data);
                            json compass_json;
                            dc_data.status = port_flag ? "connected" : "disconnected";
                            compass_json["connection_status"] = dc_data.status;
                            if(OFFSET(MAGHEADING_OFFSET) & dc_data.flag)
                            {
                                compass_json["mag_heading"] = dc_data.Magheading;
                            }
                            if(OFFSET(PITCH_OFFSET) & dc_data.flag)
                            {
                                compass_json["pitch"] = dc_data.Pitch;
                            }
                            if(OFFSET(ROLL_OFFSET) & dc_data.flag)
                            {
                                compass_json["roll"] = dc_data.Roll;
                            }
                            json_data["port_" + std::to_string(port)] = compass_json;
                            break;
                        }
                        case 4004: {
                            ParsedData_BP bp_data = bp.readBalPressureData(data);
                            json pressure_json;
                            bp_data.status = port_flag ? "connected" : "disconnected";
                            pressure_json["connection_status"] = bp_data.status;
                            if(OFFSET(BALPRES_OFFSET) & bp_data.flag)
                            {
                                pressure_json["bal_pressure"] = bp_data.BalPressure;
                            }
                            json_data["port_" + std::to_string(port)] = pressure_json;
                            break;
                        }
                        case 4005: {
                            ParsedData_HP hp_data = hp.readHelPressureData(data);
                            json helium_pressure_json;
                            hp_data.status = port_flag ? "connected" : "disconnected";
                            helium_pressure_json["connection_status"] = hp_data.status;
                            if(OFFSET(HELPRES_OFFSET) & hp_data.flag)
                            {
                                helium_pressure_json["hel_pressure"] = hp_data.HelPressure;
                            }
                            json_data["port_" + std::to_string(port)] = helium_pressure_json;
                            break;
                        }
                        case 4006: {
                            ParsedData_AS as_data = as.readAdamsSensorData(data);
                            json adams_sensor_json;
                            as_data.status = port_flag ? "connected" : "disconnected";
                            adams_sensor_json["connection_status"] = as_data.status;
                            if(OFFSET(TENSION) & as_data.flag)
                            {
                                adams_sensor_json["tension"] = as_data.Tension;
                            }
                            if(OFFSET(MAX_TENSION) & as_data.flag)
                            {
                                adams_sensor_json["max_tension"] = as_data.MaxTension;
                            }
                            json_data["port_" + std::to_string(port)] = adams_sensor_json;
                            break;
                        }
                        default:
                            break;
                    }
                }
            }
        }
#ifdef WINDOWS        
        Sleep(200);
#else
        usleep(200 * 1000);
#endif        
    }
    connect_thread_flag = false;
}

void ping_host() {
    bool reachable = false;
    while (true) {
        bool reachable = check_host_reachable(host);
        connect_flag = reachable;
        if (connect_flag) {
            std::cout << "Host reachable, starting port connections..." << std::endl;
            if(!connect_thread_flag)
            {
                std::thread(continuous_port_connection).detach();
            }
        } else {
            std::cout << "Host unreachable, disconnecting..." << std::endl;
            for (auto &socket_pair : sockets) {
                if (socket_pair.second != INVALID_SOCKET) {
 #ifdef WINDOWS                
                    closesocket(socket_pair.second);
 #else
                    close(socket_pair.second);
#endif
                    socket_pair.second = INVALID_SOCKET;
                }           
            }
        }
#ifdef WINDOWS
        Sleep(5*1000);
#else        
        usleep(1*1000*1000);
#endif        
    }
}

bool check_host_reachable(const std::string &ip_address) {
    try {
#ifdef WINDOWS        
        std::string command = "ping -n 1 -w 1000 " + ip_address;
#else
        std::string command = "ping -c 1 -W 1 " + ip_address;
#endif        
        int return_code = system(command.c_str());

        if (return_code == 0) {
            std::cout << "Host " << ip_address << " is reachable." << std::endl;
            return true;
        } else {
            std::cout << "Host " << ip_address << " is unreachable." << std::endl;
            return false;
        }
    } catch (const std::exception &e) {
        std::cerr << "Error occurred while pinging " << ip_address << ": " << e.what() << std::endl;
        return false;
    }
}

std::string connect_to_port(int port) 
{
    if (connection_status.find(port) == connection_status.end()) {
        connection_status[port] = false;

    }
    if (sockets.find(port) == sockets.end()) {
        sockets[port] = INVALID_SOCKET;
    }

    try {
        if (connection_status[port] && sockets[port] != INVALID_SOCKET) 
        {
            std::cout << "Listening to " << host << ":" << port << std::endl;
            if (port == 4006)
            {
                send(sockets[port], TENSION_REQ_MSG.c_str(), TENSION_REQ_MSG.size(), 0);
            }

            char buffer[1024] = {0};
            int bytesReceived = recv(sockets[port], buffer, sizeof(buffer), 0);
            if (bytesReceived > 0)
            {
                std::cout << "Data: " << buffer << std::endl;
                return std::string(buffer, bytesReceived);
            } 
            else
            {
                std::cerr << "Connection Timed out to " << host << ":" << port << std::endl;
                connection_status[port] = false;
                port_flag = false;
#ifdef WINDOWS                
                closesocket(sockets[port]);
#else
                close(sockets[port]);
#endif                        
                sockets[port] = INVALID_SOCKET;
            }
        }
        else
        {
#ifdef WINDOWS     
            SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
#else            
            int sock = socket(AF_INET, SOCK_STREAM, 0);
#endif            
            if (sock == INVALID_SOCKET)
            {
                std::cerr << "Socket creation failed\n";
                port_flag = false;
                return "";
            }

            
#ifdef WINDOWS
            int timeout = 1*1000;
            setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (char *)&timeout, sizeof(timeout));
#else
            struct timeval timeout;
            timeout.tv_sec = 1;
            timeout.tv_usec = 0;
            setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
#endif
            sockaddr_in serverAddress;
            serverAddress.sin_family = AF_INET;
            serverAddress.sin_port = htons(port);
            inet_pton(AF_INET, host.c_str(), &serverAddress.sin_addr);

            if (connect(sock, (sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR)
            {
                std::cerr << "Connection Timed out to " << host << ":" << port << "\n";
                port_flag = false;
#ifdef WINDOWS                
                closesocket(sock);
                Sleep(1*1000);
#else
                close(sock);
                usleep(1*1000*1000);
#endif                                
                return "";
            }
            else
            {
                port_flag = true;
            }

            std::cout << "Connected to " << host << ":" << port << std::endl;
            connection_status[port] = true;
            sockets[port] = sock;

            if (port == 4006)
            {
                send(sock, TENSION_REQ_MSG.c_str(), TENSION_REQ_MSG.size(), 0);
            }
            char buffer[1024] = {0};
            int bytesReceived = recv(sock, buffer, sizeof(buffer), 0);
            if (bytesReceived > 0)
            {
                std::cout << "Data: " << buffer << std::endl;
                return std::string(buffer, bytesReceived);
            }
        }
    } catch (...) 
    {
        std::cerr << "Exception in connecting to port " << port << std::endl;
        connection_status[port] = false;
        port_flag = false;
        if (sockets[port] != INVALID_SOCKET)
        {
 #ifdef WINDOWS
            	    closesocket(sockets[port]);
 #else
                    close(sockets[port]);
#endif
            sockets[port] = INVALID_SOCKET;
        }
    }
    return "";
}

// Simulated Modbus fetch function (to be replaced with real Modbus code)
std::string fetch_modbus_data() 
{
    json get_response_json;
    if(json_data_modbus.empty())
    {
        get_response_json["port_data"] = nullptr;
    }
    else
    {
        get_response_json["port_data"] = json_data_modbus;
    }
        
    return get_response_json.dump();
}

// Fetch and parse data from raw TCP sockets for the specified port
std::string fetch_raw_tcp_data() {
    json get_response_json;

    std::lock_guard<std::mutex> lock(port_data_mutex);

    if (json_data.empty()) {
        get_response_json["port_data"] = nullptr;
    } else {
        get_response_json["port_data"] = json_data;
    }

    return get_response_json.dump();
}

// Function to fetch data based on the current phase
std::string fetch_data() {
    if (phase) {
        // Fetch data using Modbus
        return fetch_modbus_data();
    } else {
        // Fetch data using Raw TCP
        return fetch_raw_tcp_data();
    }
}

#ifdef WINDOWS
std::string connect_and_send_to_port(const std::string &command) {
    if (host.empty()) {
        return "Host is not configured";
    }

    try {
        SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == INVALID_SOCKET) {
            std::cerr << "Socket creation failed\n";
            return "Socket creation failed";
        }

        sockaddr_in serverAddress;
        serverAddress.sin_family = AF_INET;
        serverAddress.sin_port = htons(target_port);
        inet_pton(AF_INET, host.c_str(), &serverAddress.sin_addr);

        if (connect(sock, (sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR) {
            std::cerr << "Connection failed to " << host << ":" << target_port << "\n";
            closesocket(sock);
            return "Connection failed";
        }
        std::cout << "Connected to " << host << ":" << target_port << std::endl;
        send(sock, command.c_str(), command.size(), 0);
        
        char buffer[1024] = {0};
        int bytesReceived = recv(sock, buffer, sizeof(buffer), 0);
        closesocket(sock);
        return "Command sent successfully";
    } catch (const std::exception &e) {
        std::cerr << "Error on port " << target_port << ": " << e.what() << std::endl;
        return "Error occurred";
    }
}
#else
std::string connect_and_send_to_port(const std::string &command) {
    if (host.empty()) {
        return "Host is not configured";
    }

    try {
        int sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock < 0) {
            std::cerr << "Socket creation failed\n";
            return "Socket creation failed";
        }

        sockaddr_in serverAddress{};
        serverAddress.sin_family = AF_INET;
        serverAddress.sin_port = htons(target_port);
        inet_pton(AF_INET, host.c_str(), &serverAddress.sin_addr);

        if (connect(sock, (sockaddr*)&serverAddress, sizeof(serverAddress)) < 0) {
            std::cerr << "Connection failed to " << host << ":" << target_port << "\n";
            close(sock);
            return "Connection failed";
        }

        std::cout << "Connected to " << host << ":" << target_port << std::endl;
        send(sock, command.c_str(), command.size(), 0);

        char buffer[1024] = {0};
        recv(sock, buffer, sizeof(buffer), 0);
        close(sock);
        return "Command sent successfully";
    } catch (const std::exception &e) {
        std::cerr << "Error on port " << target_port << ": " << e.what() << std::endl;
        return "Error occurred";
    }
}
#endif

void handle_device_commands(const std::string &command) {
    if (command.substr(0, 5) == "@01DO") {
        std::string command_type = command.substr(5, 2);
        
        if (command_type == "00") {
            state_4007["field1"] = "ON";
            state_4007["field2"] = "ON";
        } else if (command_type == "01") {
            state_4007["field1"] = "OFF";
            state_4007["field2"] = "ON";
        } else if (command_type == "02") {
            state_4007["field1"] = "ON";
            state_4007["field2"] = "OFF";
        } else if (command_type == "03") {
            state_4007["field1"] = "OFF";
            state_4007["field2"] = "OFF";
        }
        else if (command_type == "11") {
            state_4007["field3"] = "ON";
        } else if (command_type == "12") {
            state_4007["field3"] = "OFF";
        }
    }
}

void handle_send_device_commands(const json &json_data, httplib::Response &res) {
    if(phase)
    {
        if (modbus_host.empty()) {
            res.status = 500;
            res.set_content(R"({"error": "Host is not configured"})", "application/json");
            return;
        }   
        if (!check_host_reachable(modbus_host)) {
            res.set_content(R"({"connection_status": "disconnected"})", "application/json");
            return;
        }
    }
    else
    {
        if (host.empty()) {
            res.status = 500;
            res.set_content(R"({"error": "Host is not configured"})", "application/json");
            return;
        }   
        if (!check_host_reachable(host)) {
            res.set_content(R"({"connection_status": "disconnected"})", "application/json");
            return;
        }

    }

    if (json_data.is_null()) {
        res.status = 400;
        res.set_content(R"({"error": "No JSON data received"})", "application/json");
        return;
    }

    if(phase)
    {
        bool primary_blower_value = json_data.value("primary_blower", false);
        bool secondary_blower_value = json_data.value("secondary_blower", false);
        bool strobe_lights_value = json_data.value("strobe_lights", false);
        bool payload_power_value = json_data.value("payload_power", false);
        int relay_setting = (primary_blower_value << 3) | (secondary_blower_value << 2) | (strobe_lights_value << 1) | payload_power_value;

        if (!json_data.contains("primary_blower") && 
            !json_data.contains("secondary_blower") && 
            !json_data.contains("strobe_lights") && 
            !json_data.contains("payload_power")) 
        {
            res.status = 400;
            res.set_content(R"({"error": "No valid commands provided"})", "application/json");
            return;
        }
        
        std::cout << "Relay Settings:" << std::endl;
        std::cout << "Primary Blower: " << (primary_blower_value ? "ON" : "OFF") << std::endl;
        std::cout << "Secondary Blower: " << (secondary_blower_value ? "ON" : "OFF") << std::endl;
        std::cout << "Strobe Lights: " << (strobe_lights_value ? "ON" : "OFF") << std::endl;
        std::cout << "Payload Power: " << (payload_power_value ? "ON" : "OFF") << std::endl;

        // Set the coils based on the relay configurations
        for (const auto& config : relay_configs) {
            bool value = false;
            if (config.name == relay_configs[0].name) {
                value = primary_blower_value;
            } else if (config.name == relay_configs[1].name) {
                value = secondary_blower_value;
            } else if (config.name == relay_configs[2].name) {
                value = strobe_lights_value;
            } else if (config.name == relay_configs[3].name) {
                value = payload_power_value;
            }

            for (int relay_num : config.relay_nums) {
                if (!modbus.write_coil(relay_num - 1, value)) {
                    std::cerr << "Failed to write to relay " << relay_num << " (" << config.name << ").\n";
                }
            }

            json response_json;
            response_json["relay_response"] = "Relay settings updated successfully";
            res.set_content(response_json.dump(), "application/json");
        }
    }
    else
    {
        std::string fans_command_new = json_data.value("Fans", "");
        std::string lights_command_new = json_data.value("Lights", "");

        if (fans_command_new.empty() && lights_command_new.empty()) {
            res.status = 400;
            res.set_content(R"({"error": "No valid commands provided"})", "application/json");
            return;
        }

        std::string fans_response = "No Fans command provided";
        std::cout << "FANS COMMANDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD: " << fans_command_new << std::endl;
        if (!fans_command_new.empty() && fans_command != fans_command_new) {
            fans_command = fans_command_new;
            connect_and_send_to_port(fans_command);
            handle_device_commands(fans_command);
        }

        std::string lights_response = "No Lights command provided";
        std::cout << "LIGHTSS COMMANDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD: " << lights_command_new << std::endl;
        if (!lights_command_new.empty() && lights_command != lights_command_new) {
            lights_command = lights_command_new;
            connect_and_send_to_port(lights_command);
            handle_device_commands(lights_command);
        }

        std::stringstream response_stream;
        response_stream << "@A01,25.5,"
                        << state_4007["field1"] << ","
                        << state_4007["field2"] << ","
                        << state_4007["field3"] << "\r\n";
        json response_json;
        response_json["button_response"] = response_stream.str();
        res.set_content(response_json.dump(), "application/json");
    }
    
}

// Endpoint handler to toggle the phase (Modbus/Raw TCP switch)
void handle_toggle_phase(const httplib::Request& req, httplib::Response& res) {
    if (req.has_param("toggle")) {
        std::string toggle_value = req.get_param_value("toggle");

        if (toggle_value == "true") {
            phase = !phase;  // Toggle the phase flag
            std::cout << "Phase is now: " << (phase ? "modbustcp" : "rawtcp") << std::endl;
        }
    }

    // Respond with the current phase
    std::string response = "{ \"phase_type\": \"" + std::string(phase ? "modbustcp" : "rawtcp") + "\" }";
    res.set_content(response, "application/json");
}

void set_cors_headers(httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "http://localhost:8080");  // Allow all origins or specify your frontend IP/URL
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");  // Allowed methods
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");  // Allowed headers
}

// Endpoint handler to fetch data from the current phase (Modbus/Raw TCP)
void handle_fetch_data(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string data = fetch_data();
    auto response_json = nlohmann::json::parse(data);

    if(phase)
    {
        response_json["phase_type"] = "modbustcp";
        response_json["connection_status"] = modbus.is_connected() ? "connected" : "disconnected";
    }
    else
    {
        response_json["phase_type"] = "rawtcp";
        response_json["connection_status"] = connect_flag ? "connected" : "disconnected";   
    }
    // response_json["phase_type"] = phase ? "modbustcp" : "rawtcp";

    // Send the response with the fetched data
    res.set_content(response_json.dump(), "application/json");
}

void handle_update_config(const json &json_data, httplib::Response &res) {
    if (json_data.is_null()) {
        res.status = 400;
        res.set_content(R"({"error": "No JSON data received"})", "application/json");
        return;
    }

    if (!json_data.contains("rawtcp_host_ip") | !json_data.contains("modbustcp_host_ip")) {
        res.status = 400;
        res.set_content(R"({"error": "IP address is required"})", "application/json");
        return;
    }

    std::vector<std::string> required_ports = {"weather", "hmr", "ballonet", "helium", "adam", "ebox"};
    for (const auto &port : required_ports) {
        if (!json_data.contains(port)) {
            res.status = 400;
            res.set_content(R"({"error": "All port configurations are required"})", "application/json");
            return;
        }
    }

    host = json_data["rawtcp_host_ip"].get<std::string>();
    modbus_host = json_data["modbustcp_host_ip"].get<std::string>();

    modbus.set_host(modbus_host);
    // modbus.initSensors();
    ports = {
        json_data["weather"].get<int>(),
        json_data["hmr"].get<int>(),
        json_data["ballonet"].get<int>(),
        json_data["helium"].get<int>(),
        json_data["adam"].get<int>(),
        json_data["ebox"].get<int>()
    };

    std::thread(ping_host).detach();

    json response_json;
    response_json["message"] = "Configuration updated successfully";
    response_json["rawtcp_host_ip"] = host;
    response_json["modbustcp_host_ip"] = modbus_host;
    response_json["ports"] = ports;
    res.set_content(response_json.dump(), "application/json");
}


void handle_options_request(httplib::Response &res) {
    res.status = 204;
    set_cors_headers(res);
}

void check_modbus_connection(Modbus_TCP &modbus) {
    while (true) {
        if (modbus.is_connected() == false) {
            std::cout << "Waiting for Modbus connection..." << std::endl;
        } else {
            std::cout << "Modbus connection Successful..." << std::endl;
            modbus.initSensors();
            std::thread(continuous_port_connection_modbus).detach();
        }

#ifdef WINDOWS        
            Sleep(5000);
#else
            usleep(5000 * 1000);
#endif 
    }
}

int main() {
    httplib::Server svr;

    std::thread modbus_thread(check_modbus_connection, std::ref(modbus));   

    // Define the POST endpoint to toggle the phase
    svr.Post("/toggle-phase", handle_toggle_phase);

    // Define the GET endpoint to fetch data based on the current phase
    svr.Get("/get-port-data", handle_fetch_data);

    svr.Post("/update-config", [](const httplib::Request &req, httplib::Response &res) {
        set_cors_headers(res);
        try {
            auto json_data = json::parse(req.body);
            handle_update_config(json_data, res);
        } catch (json::parse_error &e) {
            json error_json;
            error_json["error"] = "Invalid JSON format.";
            error_json["exception"] = e.what();
            res.status = 400;
            res.set_content(error_json.dump(), "application/json");
        }
    });

    svr.Post("/send-device-commands", [](const httplib::Request &req, httplib::Response &res) {
        set_cors_headers(res);
        try {
            auto json_data = json::parse(req.body);
            handle_send_device_commands(json_data, res);
        } catch (json::parse_error &e) {
            json error_json;
            error_json["error"] = "Invalid JSON format.";
            error_json["exception"] = e.what();
            res.status = 400;
            res.set_content(error_json.dump(), "application/json");
        }
    });

    svr.Options(".*", [](const httplib::Request &, httplib::Response &res) {
        handle_options_request(res);
    });

    // Start the server on port 8080
    std::cout << "Server is running at http://localhost:5000" << std::endl;
    svr.listen("localhost", 5000);

    // std::thread(ping_host).detach();

    while(modbus.is_connected() == false) 
    {
        std::cout << "Waiting for Modbus connection..." << std::endl;
#ifdef WINDOWS        
        Sleep(500);
#else
        usleep(500 * 1000);
#endif 
    }
    std::cout << " Modbus connection Successfull..." << std::endl;

    modbus.initSensors();


    // Keep the main thread alive
    std::cout << "Press Enter to stop readings..." << std::endl;
    std::cin.get();    

    return 0;
}