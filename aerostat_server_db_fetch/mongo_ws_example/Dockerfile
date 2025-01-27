FROM maaz3073/test_docker_repo:1.0.0

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

# Run CMake to configure and build the project
RUN cmake .. -DCMAKE_BUILD_TYPE=Release && cmake --build . && make main

RUN apt install gdb -y

RUN echo "file ../bin/main" > ~/.gdbinit && \
    echo "run" >> ~/.gdbinit

# Set GDB as the default command
CMD ["gdb"]

# RUN make run

# COMMAND TO BUILD IMAGE AND RUN BACKEND
#==========================================
#
# docker build -t alfa-be . --no-cache
# docker run -it --rm -p 9001:9001 alfa-be
#
#==========================================
