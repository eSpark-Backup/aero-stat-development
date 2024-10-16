#include <map>
#include "util.h"
#include <string>
#include <vector>
#include <cstdlib>
#include "json.hpp"
#include <iostream>
#include "httplib.h"
#include <windows.h>
#include <stdexcept>
#include <winsock2.h>
#include "log_file.h"
#include "adams_sensor.h"
#include "weather_station.h"
#include "digital_compass.h"
#include "helium_pressure.h"
#include "ballonet_pressure.h"

#define OFFSET(x)    1 << x

using json = nlohmann::json;
json port_data;
std::string host;
std::vector<int> ports;
int target_port = 4006;
bool connect_flag =false;
bool port_flag =false;
bool connect_thread_flag =false;
std::mutex port_data_mutex;  // Mutex for thread safety
std::string TENSION_REQ_MSG = "#01\r";

std::map<int, bool> connection_status;
std::map<int, SOCKET> sockets;
const std::string data_4007_template = "@A01,25.5,{0},{1},{2},{3}\r\n";
std::unordered_map<std::string, std::string> state_4007 = {
    {"field1", "ON"},   // First field
    {"field2", "ON"},   // Second field
    {"field3", "OFF"},  // Third field
    {"field4", "1"}     // Fourth field
};

bool check_host_reachable(const std::string &ip_address);
std::string connect_to_port(int port);
void continuous_port_connection();

void ping_host() {
    bool reachable = false;
    while (true) {
        bool reachable = check_host_reachable(host);

        // Update connect_flag based on reachability
        connect_flag = reachable;
        if (connect_flag) {
            std::cout << "Host reachable, starting port connections..." << std::endl;
            if(!connect_thread_flag)
            {
                std::thread(continuous_port_connection).detach();  // Start the connection thread
            }
        } else {
            std::cout << "Host unreachable, disconnecting..." << std::endl;
            // Optionally, close all sockets here
            for (auto &socket_pair : sockets) {
                if (socket_pair.second != INVALID_SOCKET) {
                    closesocket(socket_pair.second);
                    socket_pair.second = INVALID_SOCKET;
                }
            }
        }
        Sleep(1000); // Check every 5 seconds
    }
}

bool check_host_reachable(const std::string &ip_address) {
    try {
        std::string command;

        // Determine the platform and create the appropriate ping command
        command = "ping -n 1 -w 1000 " + ip_address; // Windows command

        // Execute the ping command and get the return code
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

// Establish connection to a specific port
std::string connect_to_port(int port) {
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
                closesocket(sockets[port]);
                sockets[port] = INVALID_SOCKET;
            }
        }
        else
        {
            SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
            if (sock == INVALID_SOCKET)
            {
                std::cerr << "Socket creation failed\n";
                port_flag = false;
                return "";
            }

            int timeout = 1000;
            setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (char*)&timeout, sizeof(timeout));

            sockaddr_in serverAddress;
            serverAddress.sin_family = AF_INET;
            serverAddress.sin_port = htons(port);
            inet_pton(AF_INET, host.c_str(), &serverAddress.sin_addr);

            if (connect(sock, (sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR)
            {
                std::cerr << "Connection Timed out to " << host << ":" << port << "\n";
                port_flag = false;
                closesocket(sock);
                Sleep(1000);
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
            closesocket(sockets[port]);
            sockets[port] = INVALID_SOCKET;
        }
    }
    return "";
}

// Thread to handle continuous connection and data retrieval
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
                        ws_data.status = port_flag ? "Connected" : "Disconnected";
                        weather_json["connectionstatus"] = ws_data.status;
                        if(OFFSET(HEADING_OFFSET) & ws_data.flag)
                        {
                            weather_json["heading"] = ws_data.heading;
                        }
                        if(OFFSET(BAROPRES_OFFSET) & ws_data.flag)
                        {
                            weather_json["baroPres"] = ws_data.barometricPressure;
                        }
                        if(OFFSET(AIRTEMP_OFFSET) & ws_data.flag)
                        {
                            weather_json["airTemp"] = ws_data.airTemperature;
                        }
                        if(OFFSET(WINDANGLE_OFFSET) & ws_data.flag)
                        {
                            weather_json["windAngle"] = ws_data.windAngle;
                        }
                        if(OFFSET(WINDSPEED_OFFSET) & ws_data.flag)
                        {
                            weather_json["windSpeed"] = ws_data.windSpeed;
                        }
                        
                        port_data["port_" + std::to_string(port)] = weather_json;
                        break;
                    }
                    case 4003: {
                        ParsedData_DC dc_data = dc.readDigitalCompassData(data);
                        json compass_json;
                        dc_data.status = port_flag ? "Connected" : "Disconnected";
                        compass_json["connectionstatus"] = dc_data.status;
                        if(OFFSET(MAGHEADING_OFFSET) & dc_data.flag)
                        {
                            compass_json["Magheading"] = dc_data.Magheading;
                        }
                        if(OFFSET(PITCH_OFFSET) & dc_data.flag)
                        {
                            compass_json["Pitch"] = dc_data.Pitch;
                        }
                        if(OFFSET(ROLL_OFFSET) & dc_data.flag)
                        {
                            compass_json["Roll"] = dc_data.Roll;
                        }
                        port_data["port_" + std::to_string(port)] = compass_json;
                        break;
                    }
                    case 4004: {
                        ParsedData_BP bp_data = bp.readBalPressureData(data);
                        json pressure_json;
                        bp_data.status = port_flag ? "Connected" : "Disconnected";
                        pressure_json["connectionstatus"] = bp_data.status;
                        if(OFFSET(BALPRES_OFFSET) & bp_data.flag)
                        {
                            pressure_json["BalPressure"] = bp_data.BalPressure;
                        }
                        port_data["port_" + std::to_string(port)] = pressure_json;
                        break;
                    }
                    case 4005: {
                        ParsedData_HP hp_data = hp.readHelPressureData(data);
                        json helium_pressure_json;
                        hp_data.status = port_flag ? "Connected" : "Disconnected";
                        helium_pressure_json["connectionstatus"] = hp_data.status;
                        if(OFFSET(HELPRES_OFFSET) & hp_data.flag)
                        {
                            helium_pressure_json["HelPressure"] = hp_data.HelPressure;
                        }
                        port_data["port_" + std::to_string(port)] = helium_pressure_json;
                        break;
                    }
                    case 4006: {
                        ParsedData_AS as_data = as.readAdamsSensorData(data);
                        json adams_sensor_json;
                        as_data.status = port_flag ? "Connected" : "Disconnected";
                        adams_sensor_json["connectionstatus"] = as_data.status;
                        if(OFFSET(TENSION) & as_data.flag)
                        {
                            adams_sensor_json["Tension"] = as_data.Tension;
                        }
                        if(OFFSET(MAX_TENSION) & as_data.flag)
                        {
                            adams_sensor_json["MaxTension"] = as_data.MaxTension;
                        }
                        port_data["port_" + std::to_string(port)] = adams_sensor_json;
                        break;
                    }
                    default:
                        break;
                    }
                }
            }
        }
        Sleep(200);  // Avoid overloading the CPU, adjust as needed
    }
    connect_thread_flag = false;
}

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
        
        // Optionally receive a response (uncomment if needed)
        // char buffer[1024] = {0};
        // int bytesReceived = recv(sock, buffer, sizeof(buffer), 0);
        // closesocket(sock);
        // return std::string(buffer, bytesReceived);

        closesocket(sock);
        return "Command sent successfully";
    } catch (const std::exception &e) {
        std::cerr << "Error on port " << target_port << ": " << e.what() << std::endl;
        return "Error occurred";
    }
}

void handle_device_commands(const std::string &command) {
    if (command.substr(0, 5) == "@01DO") {
        std::string command_type = command.substr(5, 2);
        
        // Update states based on the command type
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
        } else if (command_type == "10") {
            state_4007["field3"] = "ON";
            state_4007["field4"] = "1";
        } else if (command_type == "11") {
            state_4007["field3"] = "OFF";
            state_4007["field4"] = "1";
        } else if (command_type == "12") {
            state_4007["field3"] = "ON";
            state_4007["field4"] = "0";
        } else if (command_type == "13") {
            state_4007["field3"] = "OFF";
            state_4007["field4"] = "0";
        }
    }
}

// Handler for sending device commands
void handle_send_device_commands(const json &json_data, httplib::Response &res) {
    if (host.empty()) {
        res.status = 500;
        res.set_content(R"({"error": "Host is not configured"})", "application/json");
        return;
    }

    if (!check_host_reachable(host)) {
        res.set_content(R"({"connection_status": "Disconnected"})", "application/json");
        return;
    }

    if (json_data.is_null()) {
        res.status = 400;
        res.set_content(R"({"error": "No JSON data received"})", "application/json");
        return;
    }

    std::string fans_command = json_data.value("Fans", "");
    std::string lights_command = json_data.value("Lights", "");

    if (fans_command.empty() && lights_command.empty()) {
        res.status = 400;
        res.set_content(R"({"error": "No valid commands provided"})", "application/json");
        return;
    }

    std::string fans_response = "No Fans command provided";
    if (!fans_command.empty()) {
        handle_device_commands(fans_command);
    }

    std::string lights_response = "No Lights command provided";
    if (!lights_command.empty()) {
        handle_device_commands(lights_command);
    }

    std::stringstream response_stream;
    response_stream << "@A01,25.5,"
                    << state_4007["field1"] << ","
                    << state_4007["field2"] << ","
                    << state_4007["field3"] << ","
                    << state_4007["field4"] << "\r\n";

    json response_json;
    response_json["ButtonResponse"] = response_stream.str();

    res.set_content(response_json.dump(), "application/json");
}

// Handler for get-port-data
void handle_get_port_data(httplib::Response &res) {
    json get_response_json;
    get_response_json["connection_status"] = connect_flag ? "Connected" : "Disconnected";

    if (host.empty()) {
        res.status = 500;
        res.set_content(R"({"error": "Host is not configured"})", "application/json");
        return;
    }
    std::lock_guard<std::mutex> lock(port_data_mutex);  // Thread-safe access to port_data

    if (port_data.empty()) {
        get_response_json["port_data"] = nullptr;
    } else {
        get_response_json["port_data"] = port_data;
    }
    res.set_content(get_response_json.dump(), "application/json");
}

void handle_update_config(const json &json_data, httplib::Response &res) {
    // Validate incoming JSON data
    if (json_data.is_null()) {
        res.status = 400;
        res.set_content(R"({"error": "No JSON data received"})", "application/json");
        return;
    }

    if (!json_data.contains("ip")) {
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

    // Update host and ports
    host = json_data["ip"].get<std::string>();
    ports = {
        json_data["weather"].get<int>(),
        json_data["hmr"].get<int>(),
        json_data["ballonet"].get<int>(),
        json_data["helium"].get<int>(),
        json_data["adam"].get<int>(),
        json_data["ebox"].get<int>()
    };

    std::thread(ping_host).detach();

    // Respond with success message
    json response_json;
    response_json["message"] = "Configuration updated successfully";
    response_json["ip"] = host;
    response_json["ports"] = ports;
    res.set_content(response_json.dump(), "application/json");
}

void set_cors_headers(httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "http://localhost:8080");  // Allow all origins or specify your frontend IP/URL
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");  // Allowed methods
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");  // Allowed headers
}

void handle_options_request(httplib::Response &res) {
    res.status = 204;  // No Content for OPTIONS requests
    set_cors_headers(res);
}

int main() {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed." << std::endl;
        return 1;
    }

    setup_log_directory();
    create_log_file();

    httplib::Server svr;

    svr.Get("/get-port-data", [](const httplib::Request &, httplib::Response &res) {
        set_cors_headers(res);
        handle_get_port_data(res);
    });

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

    // Handle OPTIONS requests for preflight
    svr.Options(".*", [](const httplib::Request &, httplib::Response &res) {
        handle_options_request(res);  // Respond with CORS headers
    });

    std::cout << "Server is running on http://localhost:5000" << std::endl;
    svr.listen("localhost", 5000);

    WSACleanup();
    return 0;
}
