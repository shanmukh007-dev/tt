# Multi-stage Dockerfile for AutoPulse VSM (React + Spring Boot)
# 1. Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# 2. Build Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend
COPY backend-spring/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend-spring/src ./src
# Copy production frontend build into Spring Boot static directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests -B

# 3. Production Runtime Container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/vsm-backend-1.0.0.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=h2
ENTRYPOINT ["java", "-jar", "app.jar"]
