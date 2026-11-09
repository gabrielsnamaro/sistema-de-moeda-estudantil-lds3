# Imagem de produção da API (deploy no Render ou em qualquer host que rode Docker).
# Etapa 1: compila o jar com Maven.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

# Etapa 2: roda só o jar numa JRE enxuta.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Ajustes para a instância gratuita (512 MB e CPU fracionada): heap proporcional ao contêiner,
# GC serial e compilação só em C1, que encurta a subida.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
