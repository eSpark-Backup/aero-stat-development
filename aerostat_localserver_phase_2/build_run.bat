@echo off

:: Print the start of the script execution
echo Starting the build process...

:: Create the build directory and navigate into it
echo Creating build directory...
mkdir build
cd build

:: Run cmake to configure the project
echo Running cmake to configure the project...
cmake -DCMAKE_BUILD_TYPE=Release ..

:: Build the project
echo Building the project...
cmake --build .

:: Navigate to the debug directory and run the test executable
echo Navigating to the debug directory...
cd debug

echo Running the test executable...
TEST.exe

:: Return to the original directory
echo Returning to the original directory...
cd ..

:: Print the end of the script execution
echo Build and test execution completed.
cd ..