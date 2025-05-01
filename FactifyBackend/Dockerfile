FROM maven:3-openjdk-17 AS build
WORKDIR /build
COPY ./FactifyBackend ./FactifyBackend
WORKDIR /build/FactifyBackend
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /build/FactifyBackend/target/FactifyBackend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
