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
#define INVALID_SOCKET -1

class TcpConnectionManager {
    public:
        std::map<int, int> sockets;
        std::string TENSION_REQ_MSG = "#01\r";
        bool port_flag =false;
        std::map<int, bool> connection_status;
        std::string connect_to_port(int port, std::string host) 
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
};

#endif //TCP_CONNECTION_MANAGER