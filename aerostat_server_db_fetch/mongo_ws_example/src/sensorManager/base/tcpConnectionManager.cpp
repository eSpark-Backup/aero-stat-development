#include <iostream>
#include <cmath>
#include "sensorsManager/base/tcpConnectionManager.h"
#include "logger/logger.h"

std::string TcpConnectionManager::strip(const std::string& str) {
    auto start = str.begin();
    while (start != str.end() && std::isspace(*start)) {
        ++start;
    }

    auto end = str.end();
    do {
        --end;
    } while (end != start && std::isspace(*end));

    return std::string(start, end + 1);
}

float TcpConnectionManager::formatFloat(float value) {
    return std::ceil(value * 100.0) / 100.0;; // Round to 2 decimal places
}

#define MOCK_TCP_CONNECTION false
#if MOCK_TCP_CONNECTION != true
std::string TcpConnectionManager::connect_to_port(int port, std::string host) 
{
    LOG_INFO("IN %s", __FUNCTION__);
    if (connection_status.find(port) == connection_status.end()) {
        connection_status[port] = false;
    }
    if (sockets.find(port) == sockets.end()) {
        sockets[port] = INVALID_SOCKET;
    }

    try {
        if (connection_status[port] && sockets[port] != INVALID_SOCKET) 
        {
            LOG_SUCCESS( "Listening to host %s : %d", host.c_str(), port);
            if (port == 4006)
            {
                send(sockets[port], TENSION_REQ_MSG.c_str(), TENSION_REQ_MSG.size(), 0);
            }

            char buffer[1024] = {0};
            int bytesReceived = recv(sockets[port], buffer, sizeof(buffer), 0);
            if (bytesReceived > 0)
            {
                LOG_VERBOSE( "Data: %s", buffer);
                return std::string(buffer, bytesReceived);
            } 
            else
            {
                LOG_ERROR("Connection Timed out to host %s : %d", host.c_str(), port);
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
                LOG_ERROR("Socket creation failed");
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
                LOG_WARNING("Connection Timed out to %s on %d",host.c_str(), port);
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

            LOG_SUCCESS( "Connected to host %s : %d", host.c_str(), port);
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
                LOG_VERBOSE( "Data: %s", buffer);
                return std::string(buffer, bytesReceived);
            }
        }
    } catch (...) 
    {
        LOG_ERROR("Exception in connecting to port %d", port);
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
#else
std::string TcpConnectionManager::connect_to_port(int port, std::string host) {
    LOG_INFO("IN %s", __FUNCTION__);
    return "";
}
#endif