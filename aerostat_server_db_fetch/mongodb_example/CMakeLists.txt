cmake_minimum_required(VERSION 3.10)

project(mongodb_example)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find the MongoDB C++ Driver.
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)
find_package(core REQUIRED)

include_directories(/usr/local/include/mongocxx/v_noabi /usr/local/include/bsoncxx/v_noabi )


add_executable(example main.cpp)

# Link MongoDB C++ Driver.
target_link_libraries(example PRIVATE mongocxx bsoncxx)

# target_link_libraries(${PROJECT_NAME} 
#   PRIVATE "${PROJECT_SOURCE_DIR}/dependencies/mongo-cxx/lib/libmongocxx.dylib"
#   PRIVATE "${PROJECT_SOURCE_DIR}/dependencies/mongo-cxx/lib/libbsoncxx.dylib"
# )
