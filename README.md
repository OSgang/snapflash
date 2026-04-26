# SnapFlash

[![Test](https://github.com/OSgang/snapflash/actions/workflows/test.yml/badge.svg)](https://github.com/OSgang/snapflash/actions/workflows/test.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=OSgang_snapflash&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=OSgang_snapflash)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=OSgang_snapflash&metric=coverage)](https://sonarcloud.io/summary/new_code?id=OSgang_snapflash)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=OSgang_snapflash&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=OSgang_snapflash)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=OSgang_snapflash&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=OSgang_snapflash)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=OSgang_snapflash&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=OSgang_snapflash)

SnapFlash is a React Native application built with Expo. The app helps learners create and review English-Vietnamese vocabulary flashcards from scanned text.

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Jest
- React Native Testing Library
- GitHub Actions
- SonarCloud

## Core Flow

1. The user opens the app and goes through the onboarding screens.
2. The app introduces instant flashcard creation, smart studying, and progress tracking.
3. The user reaches the Home screen.
4. The Home screen shows study overview data and recently accessed flashcard decks.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

You can then open the app with Expo Go, Android emulator, iOS simulator, or the web target.

Run the web version:

```bash
npm run web
```

## Testing Locally

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

The local test report is generated at:

```text
test-report/index.html
```

The LCOV coverage report used by SonarCloud is generated at:

```text
coverage/lcov.info
```

## Tested Screens

The project includes React Native component tests for:

- `__tests__/OnboardingScreen.test.tsx`
- `__tests__/HomeScreen.test.tsx`

The test suite covers rendering, user interaction, navigation-related behavior, and basic crash safety for the required screens.

## Continuous Integration

GitHub Actions runs the test workflow on push and pull request events for the `main` branch.

The workflow file is located at:

```text
.github/workflows/test.yml
```

The CI workflow:

1. Checks out the repository.
2. Installs dependencies with `npm ci`.
3. Runs `npm run test:coverage`.
4. Uploads the `test-report` artifact.
5. Runs SonarCloud analysis using `coverage/lcov.info`.

## SonarCloud

SonarCloud is configured with:

```text
sonar-project.properties
```

The project tracks:

- Coverage
- Maintainability rating
- Reliability rating
- Security rating
- Quality Gate status

Current SonarCloud project:

```text
OSgang_snapflash
```
