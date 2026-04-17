## SnapFlash Backend

This backend is now a submission-ready REST API for the SnapFlash mobile app.

It includes:

- 1 collection: `flashcards`
- Full CRUD:
  - `POST /api/flashcards`
  - `GET /api/flashcards`
  - `GET /api/flashcards/:id`
  - `PUT /api/flashcards/:id`
  - `DELETE /api/flashcards/:id`
- OpenAPI JSON: `/openapi.json`
- Swagger UI: `/api-docs`
- DTO schemas in the OpenAPI document:
  - `CreateFlashcardDto`
  - `UpdateFlashcardDto`
  - `FlashcardResponseDto`

## Run locally

```bash
npm start
```

The API starts on:

- `http://localhost:3000`
- Docs: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

## Optional environment variables

- `PORT`: defaults to `3000`
- `DATABASE_PATH`: defaults to `snapflash.db`

## Deploy on Render

Create a new **Web Service** on Render and point it to the `backend` folder.

Use these settings:

- Build Command: `npm install`
- Start Command: `npm start`

After deployment, submit the public docs link:

```text
https://your-service-name.onrender.com/api-docs
```
