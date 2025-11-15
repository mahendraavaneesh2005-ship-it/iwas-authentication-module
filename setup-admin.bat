@echo off
REM IWAS Admin Login - Quick Setup Script
REM This script verifies and fixes the admin login setup

echo.
echo ========================================
echo IWAS Admin Login - Quick Setup
echo ========================================
echo.

REM Check if Node is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    exit /b 1
)
echo ✅ Node.js found

REM Check if MongoDB is running
echo.
echo Checking MongoDB connection...
netstat -an | findstr ":27017" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MongoDB might not be running on port 27017
    echo Please ensure MongoDB is started
) else (
    echo ✅ MongoDB is running
)

REM Navigate to backend
echo.
echo Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Create admin account
echo.
echo Creating/Verifying admin account...
call npm run seed:admin

REM Navigate back
cd ..

REM Check frontend env
echo.
echo Checking frontend environment...
findstr /C:"NEXT_PUBLIC_API_URL" .env >nul 2>&1
if errorlevel 1 (
    echo ⚠️  NEXT_PUBLIC_API_URL not in .env
    echo Adding NEXT_PUBLIC_API_URL=http://localhost:4000
    echo NEXT_PUBLIC_API_URL=http://localhost:4000 >> .env
    echo ✅ Added NEXT_PUBLIC_API_URL
) else (
    echo ✅ NEXT_PUBLIC_API_URL is configured
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
if not exist node_modules (
    call npm install
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Admin Credentials:
echo   Email: admin@iwas.com
echo   Password: Arjun@16
echo.
echo To start the application:
echo   1. Terminal 1: cd backend ^&^& npm run dev
echo   2. Terminal 2: npm run dev
echo.
echo Then open: http://localhost:3000/login
echo.
pause
