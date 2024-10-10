#include <iostream>
#include <map>
#include <winsock2.h>
#include <ws2tcpip.h>
#include "adams_sensor.h"
#include "weather_station.h"
#include "digital_compass.h"
#include "helium_pressure.h"
#include "ballonet_pressure.h"

#pragma comment(lib, "Ws2_32.lib")

std::map<int, bool> connection_status;
std::map<int, SOCKET> sockets;
std::string host = "192.168.18.152";  // Change to your actual host IP
const int ports[] = {4002, 4003, 4004, 4005, 4006};
const std::string TENSION_REQ_MSG = "#01\r";

std::string connect_to_port(int port) {
    if (connection_status.find(port) == connection_status.end()) {
        connection_status[port] = false;
    }
    if (sockets.find(port) == sockets.end()) {
        sockets[port] = INVALID_SOCKET;
    }

    try {
        // If already connected
        if (connection_status[port] && sockets[port] != INVALID_SOCKET) {
            std::cout << "Listening to " << host << ":" << port << std::endl;
            if (port == 4006) {
                send(sockets[port], TENSION_REQ_MSG.c_str(), TENSION_REQ_MSG.size(), 0);
            }

            char buffer[1024] = {0};
            int bytesReceived = recv(sockets[port], buffer, sizeof(buffer), 0);
            if (bytesReceived > 0) {
                std::cout << "Data: " << buffer << std::endl;
                return std::string(buffer, bytesReceived);
            }

        } else {
            // New connection
            SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
            if (sock == INVALID_SOCKET) {
                std::cerr << "Socket creation failed\n";
                return "";
            }

            sockaddr_in serverAddress;
            serverAddress.sin_family = AF_INET;
            serverAddress.sin_port = htons(port);
            inet_pton(AF_INET, host.c_str(), &serverAddress.sin_addr);

            if (connect(sock, (sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR) {
                std::cerr << "Connection failed to " << host << ":" << port << "\n";
                closesocket(sock);
                return "";
            }

            std::cout << "Connected to " << host << ":" << port << std::endl;
            connection_status[port] = true;
            sockets[port] = sock;

            if (port == 4006) {
                send(sock, TENSION_REQ_MSG.c_str(), TENSION_REQ_MSG.size(), 0);
            }

            char buffer[1024] = {0};
            int bytesReceived = recv(sock, buffer, sizeof(buffer), 0);
            if (bytesReceived > 0) {
                std::cout << "Data: " << buffer << std::endl;
                return std::string(buffer, bytesReceived);
            }
        }
    } catch (...) {
        std::cerr << "Exception in connecting to port " << port << std::endl;
        connection_status[port] = false;
        if (sockets[port] != INVALID_SOCKET) {
            closesocket(sockets[port]);
            sockets[port] = INVALID_SOCKET;
        }
    }
    return "";
}

int main() {
    // Initialize Winsock
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    WeatherStation ws;
    DigitalCompass dc;
    BalPressure bp;
    HelPressure hp;
    AdamsSensor as;

    std::map<std::string, std::string> response;
    std::cout << "STARTING PROCESS"<< std::endl;
    while(1)
    {
        for (int port : ports) {
            std::string data = connect_to_port(port);
            if (!data.empty()) {
                switch (port) {
                    case 4002:
                        response["port_" + std::to_string(port)] = ws.readWeatherSData(data).toString();
                        std::cout << "Weather data received from port " << response["port_" + std::to_string(port)] << std::endl;
                        break;
                    case 4003:
                        response["port_" + std::to_string(port)] = dc.readDigitalCompassData(data).toString();
                        std::cout << "Digital Compass data received from port " << response["port_" + std::to_string(port)] << std::endl;
                        break;
                    case 4004:
                        response["port_" + std::to_string(port)] = bp.readBalPressureData(data).toString();
                        std::cout << "Ballonet Pressure received from port " << response["port_" + std::to_string(port)] << std::endl;
                        break;
                    case 4005:
                        response["port_" + std::to_string(port)] = hp.readHelPressureData(data).toString();
                        std::cout << "Helium Pressure data received from port " << response["port_" + std::to_string(port)] << std::endl;
                        break;
                    case 4006:
                        response["port_" + std::to_string(port)] = as.readAdamsSensorData(data).toString();
                        std::cout << "Tension Value data received from port " << response["port_" + std::to_string(port)] << std::endl;
                        break;
                    // case 4007:
                    //     // Handle port 4007 similarly
                    //     break;
                    default:
                        break;
                }
            }
        }
        Sleep(1000);
    }
    // Cleanup
    for (const auto& pair : sockets) {
        if (pair.second != INVALID_SOCKET) {
            closesocket(pair.second);
        }
    }

    WSACleanup();
    return 0;
}