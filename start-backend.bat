@echo off
echo =========================================================================
echo Starting AutoPulse VSM Backend (Spring Boot + MySQL on http://localhost:8080)
echo =========================================================================
cd backend-spring
call mvn.cmd spring-boot:run
pause
