cmake_minimum_required(VERSION 3.10)

# Set the project name
project(HTTPServer)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include_directories(
    include
    lib
)

file(GLOB_RECURSE SOURCES "src/*.cpp")

# list(REMOVE_ITEM SOURCES "${CMAKE_BINARY_DIR}/CMakeFiles/${PROJECT_NAME}.dir/CMakeCXXCompilerId.cpp")

# Add the executable
add_executable(TEST main.cpp ${SOURCES})

# Include the httplib directory if needed (optional)
# Include directories can be adjusted based on your setup
include_directories(${CMAKE_SOURCE_DIR})


# Link socket libraries for Windows
if(WIN32)
    target_link_libraries(TEST PRIVATE wsock32 ws2_32)
endif()