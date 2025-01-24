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

    static TcpConnectionManager& getInstance()
    {
        static TcpConnectionManager connectionManagerInstance;
        return connectionManagerInstance;
    }


        std::map<int, int> sockets;
        std::string TENSION_REQ_MSG = "#01\r";
        bool port_flag =false;
        std::map<int, bool> connection_status;
};

#endif //TCP_CONNECTION_MANAGER