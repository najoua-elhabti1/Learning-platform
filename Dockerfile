FROM openjdk:17-jre-slim

WORKDIR /app

COPY target/your-spring-boot-app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
