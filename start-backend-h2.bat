@echo off
echo =========================================================================
echo Starting AutoPulse VSM Backend (Spring Boot + H2 on http://localhost:8080)
echo =========================================================================
cd backend-spring
call mvn.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
pause
