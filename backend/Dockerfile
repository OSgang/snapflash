FROM eclipse-temurin:21-jdk

WORKDIR /app

RUN apt-get update && \
    apt-get install -y tesseract-ocr

COPY . .

RUN chmod +x gradlew

EXPOSE 8080

CMD ["./gradlew", "bootRun"]