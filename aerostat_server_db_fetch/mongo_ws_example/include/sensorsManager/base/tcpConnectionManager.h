#ifndef TCP_CONNECTION_MANAGER
#define TCP_CONNECTION_MANAGER

#include <string>
#include <cstring>
#include <map>

#include <unistd.h>      
#include <arpa/inet.h>  
#include <sys/socket.h>  
#include <netinet/in.h>

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


        std::map<int, int> sockets;
        std::string TENSION_REQ_MSG = "#01\r";
        bool port_flag =false;
        std::map<int, bool> connection_status;
};

#endif //TCP_CONNECTION_MANAGER