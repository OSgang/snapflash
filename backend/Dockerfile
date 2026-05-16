FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY gradlew .
COPY gradle ./gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

RUN chmod +x gradlew

COPY src ./src

RUN ./gradlew build -x test && \
    apt-get update && \
    apt-get install -y tesseract-ocr

EXPOSE 8080

CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"]