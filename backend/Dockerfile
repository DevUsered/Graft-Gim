# Etapa 1: Construcción
FROM maven:latest AS build
WORKDIR /app
# Copiamos todo el backend
COPY . .
# Compilamos el proyecto omitiendo los tests
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución
FROM openjdk:latest
WORKDIR /app
# ¡OJO AQUÍ! --from debe ir estrictamente en minúsculas
COPY --from=build /app/target/*.jar app.jar
# Exponemos el puerto
EXPOSE 8080
# Comando para arrancar Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]