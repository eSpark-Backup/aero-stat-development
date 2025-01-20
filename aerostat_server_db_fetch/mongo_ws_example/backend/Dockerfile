FROM espark1maaz/alfaops-backend

# Set the working directory inside the container
WORKDIR /home/backend

# Ensure the backend directory exists
RUN mkdir -p /home/backend

# Copy the contents of the current directory to the container's working directory
COPY /src /home/backend/src
COPY /include /home/backend/include
COPY /lib /home/backend/lib
COPY CMakeLists.txt /home/backend/

# Create the build directory
RUN mkdir build

# Set the working directory to the build directory
WORKDIR /home/backend/build

# Run CMake to configure and build the project in Release mode
RUN cmake .. -DCMAKE_BUILD_TYPE=Release && cmake --build . && make main

# Set the working directory to the bin directory where the executable is located
WORKDIR /home/backend/bin

# Run the application
RUN ./main

# Optional: Uncomment if you need to install gdb or any debugging tools
# RUN apt-get update
# RUN apt-get install -y gdb
# RUN gdb ../bin/main
