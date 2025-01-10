cmake_minimum_required(VERSION 3.11)
project(uwebsockets)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Fetch uwebsockets
# include(FetchContent)
# FetchContent_Declare(uwebsockets GIT_REPOSITORY https://github.com/uNetworking/uWebSockets.git)
# set(FETCHCONTENT_SOURCE_DIR_UWEBSOCKETS "/path/to/your/cloned/uwebsockets")
# FetchContent_GetProperties(uwebsockets)
# if(NOT uwebsockets_POPULATED)
#   FetchContent_Populate(uwebsockets)
# endif()

# Allow passing the uwebsockets source directory as a variable
if(NOT DEFINED UWEBSOCKETS_SOURCE_DIR)
  set(UWEBSOCKETS_SOURCE_DIR "/default/path/to/uwebsockets")
endif()

# Add libraries from uwebsockets
add_library(
  usockets
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/bsd.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/context.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/loop.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/socket.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/crypto/openssl.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/crypto/sni_tree.cpp
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/crypto/openssl.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/eventing/epoll_kqueue.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/eventing/gcd.c
  ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src/eventing/libuv.c)
target_include_directories(usockets PUBLIC ${UWEBSOCKETS_SOURCE_DIR}/uSockets/src)
target_compile_options(usockets PRIVATE -flto -O3)
target_compile_features(usockets PRIVATE cxx_std_11)
target_compile_definitions(usockets PRIVATE -DLIBUS_NO_SSL)
add_library(uwebsockets INTERFACE)
target_include_directories(uwebsockets INTERFACE ${UWEBSOCKETS_SOURCE_DIR}/src)
target_link_libraries(uwebsockets INTERFACE usockets z)
target_compile_features(uwebsockets INTERFACE cxx_std_20)
target_compile_options(uwebsockets INTERFACE -flto -O3)

# Examples
add_executable(backend server.cpp)
target_link_libraries(backend PRIVATE uwebsockets)