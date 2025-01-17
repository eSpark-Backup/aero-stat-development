# Set the project name and version
cmake_minimum_required(VERSION 3.10)
project(MyProject VERSION 1.0)

# Set C++ standard and compiler flags
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -ggdb -O3")

# Define directories
set(SRC_DIR ${CMAKE_SOURCE_DIR}/src)

# set(PROT_BASE_INC ${CMAKE_SOURCE_DIR}/include/protocol_base)
set(PROT_BASE_SRC ${CMAKE_SOURCE_DIR}/src/protocol_base)

# set(PROT_INC ${CMAKE_SOURCE_DIR}/include/protocols)
set(PROT_SRC ${CMAKE_SOURCE_DIR}/src/protocols)

# Databases
set(DB_FAC_INC ${CMAKE_SOURCE_DIR}/include/database_factory)
set(DB_FAC_SRC ${CMAKE_SOURCE_DIR}/src/databases)

set(DB_INC ${CMAKE_SOURCE_DIR}/include/database_factory)
set(DB_SRC ${CMAKE_SOURCE_DIR}/src/databases)

set(INCLUDE_DIR ${CMAKE_SOURCE_DIR}/include)
set(LIB_DIR ${CMAKE_SOURCE_DIR}/lib)
set(BIN_DIR ${CMAKE_SOURCE_DIR}/bin)

# Temporary directory for environment variables
set(ENV{TMPDIR} ${CMAKE_SOURCE_DIR}/tmp)

# Allow passing the uwebsockets source directory as a variable
if(NOT DEFINED UWEBSOCKETS_SOURCE_DIR)
  set(UWEBSOCKETS_SOURCE_DIR "/home/alfa/uWebSockets")
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

# Find required libraries
find_package(CURL REQUIRED)
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)

# Find the pthread library
find_package(Threads REQUIRED)

# Include directories for MongoDB C++ Driver
include_directories(${INCLUDE_DIR} ${LIB_DIR} ${CURL_INCLUDE_DIR} /usr/local/include/mongocxx/v_noabi /usr/local/include/bsoncxx/v_noabi)

# Specify the executable
set(EXECUTABLE main)

# Find all source files in the src directory (recursive for subdirectories)
file(GLOB_RECURSE SOURCES 
    "${SRC_DIR}/*.cpp" 
    # "${PROT_BASE_SRC}/*.cpp" 
    # "${PROT_SRC}/*.cpp"
    )

# Add the executable
add_executable(${EXECUTABLE} ${SOURCES})

# Link pthread to your executable
target_link_libraries(${EXECUTABLE} PRIVATE Threads::Threads)

target_link_libraries(${EXECUTABLE} PRIVATE uwebsockets)

# Include directories
target_include_directories(${EXECUTABLE} PRIVATE ${INCLUDE_DIR} ${CURL_INCLUDE_DIR})

# Link MongoDB C++ Driver and CURL
target_link_libraries(${EXECUTABLE} PRIVATE mongocxx bsoncxx ${CURL_LIBRARIES})

# Specify the output directory for the binary
set_target_properties(${EXECUTABLE} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${BIN_DIR}
)

# Define a custom target for running the program
add_custom_target(run
    COMMAND ${CMAKE_COMMAND} --build ${CMAKE_BINARY_DIR} --target ${EXECUTABLE}
    COMMAND ${BIN_DIR}/${EXECUTABLE}
    DEPENDS ${EXECUTABLE}
)

# Clean target (use "make clean" or equivalent)
