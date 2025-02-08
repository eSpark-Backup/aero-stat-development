#ifndef TCP_CONNECTION_MANAGER
#define TCP_CONNECTION_MANAGER

#include <string>
#include <cstring>
#include <map>

#include <unistd.h>      
#include <arpa/inet.h>  
#include <sys/socket.h>  
#include <netinet/in.h>
#include "logger/logger.h"

#define SOCKET_ERROR -1
#ifndef INVALID_SOCKET
#warning INVALID SOCKET was not Define so defining at as (-1)
#define INVALID_SOCKET (-1)
#endif


class TcpConnectionManager {
    public:
    std::string connect_to_port(int port, std::string host);
    std::string strip(const std::string& str);
    float formatFloat(float value);
    static TcpConnectionManager& getInstance()
    {
        static TcpConnectionManager connectionManagerInstance;
        return connectionManagerInstance;
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
                // std::cout << "Host " << ip_address << " is reachable." << std::endl;
                LOG_SUCCESS("Host %s is reachable.", ip_address.c_str());
                return true;
            } else {
                // std::cout << "Host " << ip_address << " is unreachable." << std::endl;
                LOG_ERROR("Host %s is unreachable.", ip_address.c_str());
                return false;
            }
        } catch (const std::exception &e) {
            // std::cerr << "Error occurred while pinging " << ip_address << ": " << e.what() << std::endl;
            LOG_ERROR("Error occurred while pinging %s : %s", ip_address, e.what());
            return false;
        }
    }


    std::string connect_and_send_to_port(const std::string &command, std::string host, int target_port) {
        if (host.empty()) {
            return "Host is not configured";
        }

        try {
            int sock = socket(AF_INET, SOCK_STREAM, 0);
            if (sock < 0) {
                // std::cerr << "Socket creation failed\n";
                LOG_ERROR("Socket creation failed");
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

            // std::cout << "Connected to " << host << ":" << target_port << std::endl;
            LOG_SUCCESS("Connected to %s : port %d", host.c_str(), target_port);
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


        std::map<int, int> sockets;
        std::string TENSION_REQ_MSG = "#01\r";
        bool port_flag =false;
        std::map<int, bool> connection_status;
};

#endif //TCP_CONNECTION_MANAGER