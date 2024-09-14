FROM openjdk:17-oracle
WORKDIR /app

COPY target/Stage_Histo2-0.0.1-SNAPSHOT.jar /app/Stage_Histo2-0.0.1-SNAPSHOT.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "Stage_Histo2-0.0.1-SNAPSHOT.jar"]
