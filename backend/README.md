# SnapFlash Backend

This is the backend for SnapFlash, currently scaffolded with:

- Kotlin
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Flyway
- Spring Security
- PostgreSQL / Neon

At the moment, this project is a backend foundation that is ready for further development. It is already configured to run locally with the `local` profile and connect to Neon/PostgreSQL.

## Requirements

- Java 21
- Internet access on the first Gradle run to download dependencies
- A PostgreSQL or Neon database

## Important Structure

```text
backend/
  build.gradle.kts
  gradlew
  src/main/kotlin/com/osgang/backend/BackendApplication.kt
  src/main/resources/application.properties
  src/main/resources/application-local.properties.example
```

## Local Database Configuration

The project currently enables the `local` profile in [application.properties](./src/main/resources/application.properties), so for local development you only need to create a real local config file from the example file.

### Step 1: Copy the example file

```bash
cp src/main/resources/application-local.properties.example \
   src/main/resources/application-local.properties
```

### Step 2: Fill in your Neon/PostgreSQL credentials

Open `src/main/resources/application-local.properties` and replace the placeholder values:

```properties
spring.datasource.url=jdbc:postgresql://YOUR_POOLED_HOST/neondb?sslmode=require&channel_binding=require
spring.datasource.username=YOUR_ROLE
spring.datasource.password=YOUR_PASSWORD

spring.flyway.url=jdbc:postgresql://YOUR_DIRECT_HOST/neondb?sslmode=require
spring.flyway.user=YOUR_ROLE
spring.flyway.password=YOUR_PASSWORD
```

### Example: how to read a Neon connection string

Neon often shows a connection string like this:

```text
postgresql://alex:abc123@ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Breakdown:

- username: `alex`
- password: `abc123`
- host: `ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech`
- database: `neondb`

For Spring Boot, do **not** keep the username and password inside the JDBC URL. Split them into separate properties instead:

```properties
spring.datasource.url=jdbc:postgresql://ep-cool-darkness-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
spring.datasource.username=alex
spring.datasource.password=abc123
```

For Flyway, use the **direct** Neon host instead of the `-pooler` host:

```text
postgresql://alex:abc123@ep-cool-darkness-a1b2c3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Converted to Spring Boot Flyway properties:

```properties
spring.flyway.url=jdbc:postgresql://ep-cool-darkness-a1b2c3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
spring.flyway.user=alex
spring.flyway.password=abc123
```

Current convention:

- `spring.datasource.*`: uses the Neon pooled connection for the application runtime
- `spring.flyway.*`: uses the Neon direct connection for database migrations

Notes:

- Do not commit `application-local.properties`
- That file is already ignored in `.gitignore`

## Running the Backend

From the `backend/` directory, run:

```bash
./gradlew bootRun
```

On Windows:

```bat
gradlew.bat bootRun
```

If everything is configured correctly, the app will start on:

```text
http://localhost:8080
```

## Running Tests

```bash
./gradlew test
```

## Why Does localhost Show a Login Page?

The project already includes `Spring Security`, but it does not yet define a custom security configuration.

Because of that, Spring Boot enables the default login flow automatically:

- the default login form
- the default username: `user`
- a generated temporary password printed in the application logs at startup

This is expected behavior at the current stage of the project.

## Flyway

Flyway is already included in the project. Database migration files should be placed in:

```text
src/main/resources/db/migration
```

Example:

```text
src/main/resources/db/migration/V1__init.sql
```

## Common Issues

### 1. Flyway cannot connect to Neon

Check the following:

- `spring.datasource.url` uses the `-pooler` host
- `spring.flyway.url` uses the direct host, not the `-pooler` host
- the URL format starts with `jdbc:postgresql://`
- the username and password are not embedded directly inside the JDBC URL

### 2. Gradle does not run on the first try

The first `./gradlew bootRun` may take some time because Gradle needs to download the wrapper and all required dependencies.

### 3. The browser shows a login page instead of an API response

That is caused by Spring Security default configuration. It is not an error.

## Current Status

The backend is currently in the scaffold phase:

- Spring Boot starts successfully
- database connection works through local configuration
- Flyway, JPA, and Security are already included
- business modules such as `deck`, `flashcard`, `auth`, and `study` have not been implemented yet

## Recommended Next Steps

1. Create the first Flyway migration: `V1__init.sql`
2. Create the first module: `deck`
3. Add the first entity, repository, and controller
4. Add OpenAPI / Swagger UI
