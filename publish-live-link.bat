@echo off
title AutoPulse VSM - Publish Live Web Link
color 0b

echo ===================================================
echo   AutoPulse VSM - Generate Instant Live Public URL
echo ===================================================
echo.
echo 1. Starting Unified Backend (Spring Boot + React UI)...
cd /d "%~dp0backend-spring"
start "AutoPulse VSM Server" cmd /k "java -jar target\vsm-backend-1.0.0.jar --spring.profiles.active=h2"

echo 2. Waiting 5 seconds for server initialization...
timeout /t 5 /nobreak >nul

echo 3. Generating public HTTPS link via tunnel...
echo.
echo ===================================================
echo  COPY AND SHARE THE URL DISPLAYED BELOW TO ANYONE:
echo ===================================================
echo.
call npx -y localtunnel --port 8080

pause
