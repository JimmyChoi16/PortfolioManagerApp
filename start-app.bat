@echo off
echo Starting Portfolio Manager Application...
echo.

echo 1. Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo 2. Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo 3. Starting backend server...
cd ../backend
start "Backend Server" cmd /k "npm start"

echo.
echo 4. Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Application is starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Make sure MySQL is running (via XAMPP or other MySQL server)
echo.
pause 