# Set the project name and version
cmake_minimum_required(VERSION 3.10)
project(MyProject VERSION 1.0)

# Set C++ standard and compiler flags
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -ggdb -O3")


# Define the directories (relative to the project root)
set(SRC_DIR ${CMAKE_SOURCE_DIR}/src)
set(INCLUDE_DIR ${CMAKE_SOURCE_DIR}/include)
set(LIB_DIR ${CMAKE_SOURCE_DIR}/lib)
set(BIN_DIR ${CMAKE_SOURCE_DIR}/bin)

set(ENV{TMPDIR} ${CMAKE_SOURCE_DIR}/tmp)

# Find the MongoDB C++ Driver.
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)
find_package(core REQUIRED)

include_directories(/usr/local/include/mongocxx/v_noabi /usr/local/include/bsoncxx/v_noabi )

# Specify the executable
set(EXECUTABLE main)

# Find all source files in the src directory
file(GLOB SOURCES "${SRC_DIR}/*.cpp")

# Add the executable
add_executable(${EXECUTABLE} ${SOURCES})

# Include directories
target_include_directories(${EXECUTABLE} PRIVATE ${INCLUDE_DIR})

# Link MongoDB C++ Driver.
target_link_libraries(${EXECUTABLE} PRIVATE mongocxx bsoncxx)

# Link directories (if you have libraries)
target_link_directories(${EXECUTABLE} PRIVATE ${LIB_DIR})

# Add any libraries if needed
# target_link_libraries(${EXECUTABLE} <library_name>)

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

# Clean target (CMake has a built-in clean target with "make clean")
