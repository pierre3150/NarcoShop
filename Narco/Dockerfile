# Stage 1: Build
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /app

# Copier les fichiers pom.xml
COPY pom.xml ./

# Télécharger les dépendances Maven
RUN mvn dependency:go-offline

# Copier le code source
COPY src ./src

# Construire l'application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

# Copier le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8080

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]

