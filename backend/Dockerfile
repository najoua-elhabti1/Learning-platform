# Stage 1: Build the application with Maven
FROM maven:3.8.6-openjdk-17 as builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Use OpenJDK to run the application
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set the entry point to run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
