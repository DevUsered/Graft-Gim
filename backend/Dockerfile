FROM maven:latest AS BUILD
WORKDIR /app

COPY . .

RUN mvn clean package -DskipTest

FROM openjdk:latest
WORKDIR /app

COPY --FROM=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]