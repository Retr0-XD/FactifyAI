# Build stage
FROM maven:3-openjdk-17 AS build
WORKDIR ./FactifyBackend
COPY . .
RUN ls -la
RUN mvn clean package -DskipTests

# Package stage
FROM openjdk:17-jdk-slim
WORKDIR /FactifyBackend
COPY --from=build /FactifyBackend/target/FactifyBackend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "FactifyBackend.jar"]
