# SnapFlash Backend

This is the backend for SnapFlash, a flashcard learning app.

The backend currently includes:

- Kotlin
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Flyway
- Spring Security
- JWT authentication
- PostgreSQL / Neon
- Tesseract OCR
- Dictionary lookup
- Gradle tests with JaCoCo

The app can register and log in users, create decks and flashcards, scan an image for word candidates, look up words in the local dictionary, and return learning statistics.

## Requirements

- Docker Desktop or Docker Engine
- Java 21, if you want to run the app without Docker
- Internet access on the first Gradle run to download dependencies
- A PostgreSQL or Neon database

Docker is the recommended way to run the project because the image already installs Tesseract OCR.

## Important Structure

```text
backend/
  build.gradle.kts
  Dockerfile
  docker-compose.yaml
  gradlew
  src/main/kotlin/com/osgang/backend/
    config/
    controller/
    dto/
    entity/
    exception/
    repository/
    service/
  src/main/resources/
    application.properties.example
    assets/anhviet.dict
    db/migration/
    openapi/snapflash-api.yaml
  src/test/kotlin/com/osgang/backend/
```

## Local Configuration

The real config file is:

```text
src/main/resources/application.properties
```

That file contains database passwords and JWT secrets, so it should stay local only.

### Step 1: Copy the example file

From the `backend/` directory, run:

```bash
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
```

### Step 2: Fill in your Neon/PostgreSQL credentials

Open `src/main/resources/application.properties` and replace the placeholder values:

```properties
spring.datasource.url=jdbc:postgresql://YOUR_POOLED_HOST/snapflash_database?sslmode=require&channel_binding=require
spring.datasource.username=YOUR_ROLE
spring.datasource.password=YOUR_PASSWORD

spring.flyway.url=jdbc:postgresql://YOUR_DIRECT_HOST/snapflash_database?sslmode=require
spring.flyway.user=YOUR_ROLE
spring.flyway.password=YOUR_PASSWORD

tesseract.datapath=/usr/share/tesseract-ocr/5/tessdata/

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

JWT_SIGNER_KEY=YOUR_64_CHARACTER_SECRET
```

### Step 3: Generate the JWT signer key

The `JWT_SIGNER_KEY` is a secret value used to sign and validate JWT tokens.

You can generate it from the Generate Random website:

1. Go to the Generate Random website
2. Generate a random string
3. Use at least 64 characters
4. Copy the value into `JWT_SIGNER_KEY`

Example:

```properties
JWT_SIGNER_KEY=70efc4af8845b86b842939a1674473197ea8f9c7dfd2fa9e10e3515995c089ee
```

Do not use the example value above in a real project. Generate your own value.

Notes:

- Do not commit `application.properties`
- `application.properties` is already ignored in `.gitignore`
- `JWT_SIGNER_KEY` is used to sign and validate JWT tokens
- If you change `JWT_SIGNER_KEY`, old JWT tokens will stop working
- The Docker image uses `/usr/share/tesseract-ocr/5/tessdata/` for Tesseract data

## Example: How to Read a Neon Connection String

Neon often shows a connection string like this:

```text
postgresql://alex:abc123@ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/snapflash_database?sslmode=require&channel_binding=require
```

Breakdown:

- username: `alex`
- password: `abc123`
- pooled host: `ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech`
- database: `snapflash_database`

For Spring Boot, do **not** keep the username and password inside the JDBC URL. Split them into separate properties instead:

```properties
spring.datasource.url=jdbc:postgresql://ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/snapflash_database?sslmode=require&channel_binding=require
spring.datasource.username=alex
spring.datasource.password=abc123
```

For Flyway, remove `-pooler` and use the direct Neon host:

```text
postgresql://alex:abc123@ep-cool-darkness-a1b2c3.ap-southeast-1.aws.neon.tech/snapflash_database?sslmode=require
```

Converted to Spring Boot Flyway properties:

```properties
spring.flyway.url=jdbc:postgresql://ep-cool-darkness-a1b2c3.ap-southeast-1.aws.neon.tech/snapflash_database?sslmode=require
spring.flyway.user=alex
spring.flyway.password=abc123
```

Current convention:

- `spring.datasource.*`: uses the Neon pooled connection for the application runtime
- `spring.flyway.*`: uses the Neon direct connection for database migrations

## Create the Docker Image and Container

For the first run, from the `backend/` directory, run:

```bash
docker compose up -d --build
```

This command does three things:

- builds the Docker image
- creates the backend container
- starts the backend in the background

The backend runs this command inside the container:

```bash
./gradlew bootRun
```

The first run can take some time because Gradle needs to download dependencies.

If everything is configured correctly, the app will start on:

```text
http://localhost:8080
```

## Docker Command Guide

Use this when you already created the container once.

### Start the existing container

```bash
docker compose up -d
```

### Restart after code changes

```bash
docker compose restart
```

Use this when the container is already running and you changed source files.

### Rebuild after dependency or Dockerfile changes

```bash
docker compose up -d --build
```

Use this after changing files such as:

- `Dockerfile`
- `docker-compose.yaml`
- `build.gradle.kts`

### Stop and delete the container

```bash
docker compose down
```

This deletes the container but keeps the image.

### Open a shell inside the container

```bash
docker exec -it snapflash-backend-1 bash
```

The current container name is usually:

```text
snapflash-backend-1
```

If the name is different, check it with:

```bash
docker compose ps
```

### See running logs

```bash
docker compose logs -f
```

This is useful for checking:

- Spring Boot startup errors
- Flyway migration errors
- the generated application logs
- OCR or dictionary loading messages

### Stop the container without deleting it

```bash
docker compose stop
```

### Start it again

```bash
docker compose start
```

## Run Without Docker

You can also run the app directly:

```bash
./gradlew bootRun
```

If you run without Docker, make sure Tesseract is installed on your machine and `tesseract.datapath` points to the correct tessdata directory.

On Ubuntu, Tesseract is usually installed with:

```bash
sudo apt-get install tesseract-ocr
```

## Run Tests

Run all tests:

```bash
./gradlew test
```

The project also generates JaCoCo reports after the test task.

HTML report:

```text
build/reports/jacoco/test/html/index.html
```

## API Summary

The API uses this response wrapper:

```json
{
  "code": 200,
  "message": "Success",
  "result": {}
}
```

Public endpoints:

```text
POST /user/register
POST /user/login
POST /user/introspect
GET  /user/greet
```

Protected endpoints require this header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Protected endpoints:

```text
POST  /user/logout
PATCH /user/change-password
GET   /deck/all
GET   /deck/{deckId}
POST  /deck/new
POST  /card/new
PATCH /card/update-flip-count
GET   /card/learning-journey
GET   /card/toughest-words?limit=10
POST  /scan
GET   /lookup?word=hello
```

The OpenAPI file is here:

```text
src/main/resources/openapi/snapflash-api.yaml
```

## Authentication Flow

### Step 1: Register

```http
POST /user/register
```

```json
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "securePassword123"
}
```

### Step 2: Login

```http
POST /user/login
```

```json
{
  "username": "testuser",
  "password": "securePassword123"
}
```

The response returns a JWT token.

### Step 3: Use the JWT token

Send the token in the `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

### Step 4: Logout

```http
POST /user/logout
```

Logout stores the JWT token in the `invalid_jwt_tokens` table so it cannot be used again.

## Flyway

Flyway migration files are in:

```text
src/main/resources/db/migration
```

Current migrations:

```text
V1__init_schema.sql
V2__seed_sample_data.sql
V3__add_flipCount_column.sql
V4__logout.sql
```

Flyway runs automatically when the app starts.

## OCR and Dictionary Lookup

The scan endpoint accepts an image file:

```http
POST /scan
```

The form field name must be:

```text
multipartFile
```

The backend uses Tesseract to extract English words from the image, then checks the local dictionary file:

```text
src/main/resources/assets/anhviet.dict
```

You can also look up a word directly:

```http
GET /lookup?word=hello
```

## Common Issues

### 1. Flyway cannot connect to Neon

Check the following:

- `spring.datasource.url` uses the `-pooler` host
- `spring.flyway.url` uses the direct host, not the `-pooler` host
- both URLs start with `jdbc:postgresql://`
- the username and password are not embedded directly inside the JDBC URL

### 2. The first Docker run is slow

This is normal. The container runs Gradle, and Gradle needs to download dependencies the first time.

### 3. The app cannot find Tesseract data

Check this property:

```properties
tesseract.datapath=/usr/share/tesseract-ocr/5/tessdata/
```

This path is correct inside the Docker image. If you run the app directly on your machine, the path may be different.

### 4. Protected endpoints return 401

Check that:

- you logged in successfully
- you copied the JWT token correctly
- the request has `Authorization: Bearer YOUR_JWT_TOKEN`
- the token has not expired
- the token has not been logged out

### 5. Docker says the container name does not exist

Check the real container name:

```bash
docker compose ps
```

Then open the shell with:

```bash
docker exec -it <container_name> bash
```

## Current Status

The backend currently has working modules for:

- user registration and login
- JWT authentication and logout
- password change
- deck creation and listing
- flashcard creation
- flip count updates
- learning journey statistics
- toughest word statistics
- OCR image scanning
- dictionary lookup
- Flyway database migrations
- controller, service, and repository tests

Recommended next steps:

1. Add generated Swagger UI or serve the existing OpenAPI file through the app
2. Add refresh tokens or a more complete session strategy
3. Add update and delete APIs for decks and flashcards
4. Add production environment configuration
