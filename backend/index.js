"use strict";

const http = require("node:http");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const databasePath = path.resolve(
  __dirname,
  process.env.DATABASE_PATH || "snapflash.db",
);

const db = new DatabaseSync(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    example TEXT,
    source_language TEXT NOT NULL DEFAULT 'en',
    target_language TEXT NOT NULL DEFAULT 'vi',
    deck TEXT NOT NULL DEFAULT 'default',
    mastered INTEGER NOT NULL DEFAULT 0 CHECK (mastered IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck);
`);

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(body);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "text/html; charset=utf-8",
  });
  res.end(html);
}

async function readJsonBody(req) {
  let rawBody = "";

  for await (const chunk of req) {
    rawBody += chunk;
    if (rawBody.length > 1_000_000) {
      throw createHttpError(413, "Request body is too large.");
    }
  }

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw createHttpError(400, "Request body must be valid JSON.");
  }
}

function normalizeString(value, field, options = {}) {
  const { required = false, maxLength = 255, allowNull = false } = options;

  if (value === undefined) {
    if (required) {
      throw createHttpError(400, `${field} is required.`);
    }
    return undefined;
  }

  if (value === null) {
    if (allowNull) {
      return null;
    }
    throw createHttpError(400, `${field} cannot be null.`);
  }

  if (typeof value !== "string") {
    throw createHttpError(400, `${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed && required) {
    throw createHttpError(400, `${field} cannot be empty.`);
  }

  if (trimmed.length > maxLength) {
    throw createHttpError(
      400,
      `${field} must be at most ${maxLength} characters long.`,
    );
  }

  return trimmed || (allowNull ? null : "");
}

function normalizeBoolean(value, field) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw createHttpError(400, `${field} must be a boolean.`);
  }

  return value;
}

function validateCreateFlashcardDto(payload) {
  return {
    term: normalizeString(payload.term, "term", {
      required: true,
      maxLength: 120,
    }),
    definition: normalizeString(payload.definition, "definition", {
      required: true,
      maxLength: 500,
    }),
    example:
      normalizeString(payload.example, "example", {
        maxLength: 500,
        allowNull: true,
      }) ?? null,
    sourceLanguage:
      normalizeString(payload.sourceLanguage, "sourceLanguage", {
        maxLength: 10,
      }) ?? "en",
    targetLanguage:
      normalizeString(payload.targetLanguage, "targetLanguage", {
        maxLength: 10,
      }) ?? "vi",
    deck:
      normalizeString(payload.deck, "deck", {
        maxLength: 80,
      }) ?? "default",
    mastered: normalizeBoolean(payload.mastered, "mastered") ?? false,
  };
}

function validateUpdateFlashcardDto(payload) {
  const dto = {
    term: normalizeString(payload.term, "term", { maxLength: 120 }),
    definition: normalizeString(payload.definition, "definition", {
      maxLength: 500,
    }),
    example: normalizeString(payload.example, "example", {
      maxLength: 500,
      allowNull: true,
    }),
    sourceLanguage: normalizeString(payload.sourceLanguage, "sourceLanguage", {
      maxLength: 10,
    }),
    targetLanguage: normalizeString(payload.targetLanguage, "targetLanguage", {
      maxLength: 10,
    }),
    deck: normalizeString(payload.deck, "deck", {
      maxLength: 80,
    }),
    mastered: normalizeBoolean(payload.mastered, "mastered"),
  };

  const hasAtLeastOneField = Object.values(dto).some(
    (value) => value !== undefined,
  );

  if (!hasAtLeastOneField) {
    throw createHttpError(
      400,
      "UpdateFlashcardDto must contain at least one updatable field.",
    );
  }

  return dto;
}

function toFlashcardResponse(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    example: row.example,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    deck: row.deck,
    mastered: Boolean(row.mastered),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getFlashcardById(id) {
  const row = db
    .prepare(
      `
        SELECT id, term, definition, example, source_language, target_language,
               deck, mastered, created_at, updated_at
        FROM flashcards
        WHERE id = ?
      `,
    )
    .get(id);

  return toFlashcardResponse(row);
}

function createFlashcard(dto) {
  const timestamp = new Date().toISOString();
  const result = db
    .prepare(
      `
        INSERT INTO flashcards (
          term, definition, example, source_language,
          target_language, deck, mastered, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      dto.term,
      dto.definition,
      dto.example,
      dto.sourceLanguage,
      dto.targetLanguage,
      dto.deck,
      dto.mastered ? 1 : 0,
      timestamp,
      timestamp,
    );

  return getFlashcardById(Number(result.lastInsertRowid));
}

function listFlashcards(query) {
  const conditions = [];
  const values = [];

  if (query.deck) {
    conditions.push("deck = ?");
    values.push(query.deck);
  }

  if (query.mastered !== null) {
    conditions.push("mastered = ?");
    values.push(query.mastered ? 1 : 0);
  }

  let sql = `
    SELECT id, term, definition, example, source_language, target_language,
           deck, mastered, created_at, updated_at
    FROM flashcards
  `;

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += " ORDER BY id DESC";

  const rows = db.prepare(sql).all(...values);
  return rows.map(toFlashcardResponse);
}

function updateFlashcard(id, dto) {
  const existing = db
    .prepare(
      `
        SELECT id, term, definition, example, source_language, target_language,
               deck, mastered, created_at, updated_at
        FROM flashcards
        WHERE id = ?
      `,
    )
    .get(id);

  if (!existing) {
    throw createHttpError(404, "Flashcard not found.");
  }

  db.prepare(
    `
      UPDATE flashcards
      SET term = ?, definition = ?, example = ?, source_language = ?,
          target_language = ?, deck = ?, mastered = ?, updated_at = ?
      WHERE id = ?
    `,
  ).run(
    dto.term ?? existing.term,
    dto.definition ?? existing.definition,
    dto.example !== undefined ? dto.example : existing.example,
    dto.sourceLanguage ?? existing.source_language,
    dto.targetLanguage ?? existing.target_language,
    dto.deck ?? existing.deck,
    dto.mastered !== undefined ? (dto.mastered ? 1 : 0) : existing.mastered,
    new Date().toISOString(),
    id,
  );

  return getFlashcardById(id);
}

function deleteFlashcard(id) {
  const result = db.prepare("DELETE FROM flashcards WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw createHttpError(404, "Flashcard not found.");
  }
}

function buildBaseUrl(req) {
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (req.socket.encrypted ? "https" : "http");
  const host = req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

function buildOpenApiDocument(baseUrl) {
  return {
    openapi: "3.0.3",
    info: {
      title: "SnapFlash API",
      version: "1.0.0",
      description:
        "REST API for the SnapFlash mobile app. This submission includes one collection (`flashcards`) with full CRUD and DTO schemas.",
    },
    servers: [
      {
        url: baseUrl,
        description: "Current deployment",
      },
    ],
    tags: [
      {
        name: "flashcards",
        description: "Manage vocabulary flashcards for English-Vietnamese study.",
      },
    ],
    paths: {
      "/": {
        get: {
          summary: "Get API overview",
          responses: {
            200: {
              description: "API metadata and useful links",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiOverviewDto",
                  },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            200: {
              description: "API is running",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/HealthCheckDto",
                  },
                },
              },
            },
          },
        },
      },
      "/api/flashcards": {
        get: {
          tags: ["flashcards"],
          summary: "List flashcards",
          parameters: [
            {
              in: "query",
              name: "deck",
              schema: { type: "string" },
              description: "Filter flashcards by deck name.",
            },
            {
              in: "query",
              name: "mastered",
              schema: { type: "boolean" },
              description: "Filter flashcards by mastered state.",
            },
          ],
          responses: {
            200: {
              description: "List of flashcards",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/FlashcardListResponseDto",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["flashcards"],
          summary: "Create a flashcard",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateFlashcardDto",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Flashcard created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/FlashcardResponseDto",
                  },
                },
              },
            },
            400: {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorDto",
                  },
                },
              },
            },
          },
        },
      },
      "/api/flashcards/{id}": {
        get: {
          tags: ["flashcards"],
          summary: "Get flashcard by id",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            200: {
              description: "Single flashcard",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/FlashcardResponseDto",
                  },
                },
              },
            },
            404: {
              description: "Flashcard not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorDto",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["flashcards"],
          summary: "Update flashcard by id",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateFlashcardDto",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated flashcard",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/FlashcardResponseDto",
                  },
                },
              },
            },
            400: {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorDto",
                  },
                },
              },
            },
            404: {
              description: "Flashcard not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorDto",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["flashcards"],
          summary: "Delete flashcard by id",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            204: {
              description: "Flashcard deleted successfully",
            },
            404: {
              description: "Flashcard not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorDto",
                  },
                },
              },
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          summary: "Get the OpenAPI document",
          responses: {
            200: {
              description: "OpenAPI JSON",
            },
          },
        },
      },
      "/api-docs": {
        get: {
          summary: "Open Swagger UI documentation",
          responses: {
            200: {
              description: "Swagger UI HTML page",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ApiOverviewDto: {
          type: "object",
          required: ["name", "docsUrl", "openApiUrl", "collection"],
          properties: {
            name: {
              type: "string",
              example: "SnapFlash API",
            },
            docsUrl: {
              type: "string",
              format: "uri",
              example: `${baseUrl}/api-docs`,
            },
            openApiUrl: {
              type: "string",
              format: "uri",
              example: `${baseUrl}/openapi.json`,
            },
            collection: {
              type: "string",
              example: "flashcards",
            },
          },
        },
        HealthCheckDto: {
          type: "object",
          required: ["status", "database", "timestamp"],
          properties: {
            status: {
              type: "string",
              example: "ok",
            },
            database: {
              type: "string",
              example: "connected",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreateFlashcardDto: {
          type: "object",
          required: ["term", "definition"],
          properties: {
            term: {
              type: "string",
              example: "sustainable",
              maxLength: 120,
            },
            definition: {
              type: "string",
              example: "able to continue over a period of time",
              maxLength: 500,
            },
            example: {
              type: "string",
              nullable: true,
              example: "We need sustainable study habits.",
              maxLength: 500,
            },
            sourceLanguage: {
              type: "string",
              default: "en",
              example: "en",
              maxLength: 10,
            },
            targetLanguage: {
              type: "string",
              default: "vi",
              example: "vi",
              maxLength: 10,
            },
            deck: {
              type: "string",
              default: "default",
              example: "daily-reading",
              maxLength: 80,
            },
            mastered: {
              type: "boolean",
              default: false,
              example: false,
            },
          },
        },
        UpdateFlashcardDto: {
          type: "object",
          description:
            "Every field is optional, but at least one field must be present.",
          properties: {
            term: {
              type: "string",
              example: "sustainable",
              maxLength: 120,
            },
            definition: {
              type: "string",
              example: "can be maintained for a long time",
              maxLength: 500,
            },
            example: {
              type: "string",
              nullable: true,
              example: "A sustainable routine helps you improve faster.",
              maxLength: 500,
            },
            sourceLanguage: {
              type: "string",
              example: "en",
              maxLength: 10,
            },
            targetLanguage: {
              type: "string",
              example: "vi",
              maxLength: 10,
            },
            deck: {
              type: "string",
              example: "ielts-vocab",
              maxLength: 80,
            },
            mastered: {
              type: "boolean",
              example: true,
            },
          },
        },
        FlashcardResponseDto: {
          type: "object",
          required: [
            "id",
            "term",
            "definition",
            "example",
            "sourceLanguage",
            "targetLanguage",
            "deck",
            "mastered",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            term: {
              type: "string",
              example: "sustainable",
            },
            definition: {
              type: "string",
              example: "able to continue over a period of time",
            },
            example: {
              type: "string",
              nullable: true,
              example: "We need sustainable study habits.",
            },
            sourceLanguage: {
              type: "string",
              example: "en",
            },
            targetLanguage: {
              type: "string",
              example: "vi",
            },
            deck: {
              type: "string",
              example: "daily-reading",
            },
            mastered: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-17T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-17T10:30:00.000Z",
            },
          },
        },
        FlashcardListResponseDto: {
          type: "object",
          required: ["items", "total"],
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/FlashcardResponseDto",
              },
            },
            total: {
              type: "integer",
              example: 3,
            },
          },
        },
        ErrorDto: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              example: "Flashcard not found.",
            },
          },
        },
      },
    },
  };
}

function buildSwaggerHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SnapFlash API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "BaseLayout",
        });
      };
    </script>
  </body>
</html>`;
}

function parseFlashcardId(pathname) {
  const match = pathname.match(/^\/api\/flashcards\/(\d+)$/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function parseMasteredQuery(value) {
  if (value === null) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw createHttpError(
    400,
    "mastered query parameter must be either true or false.",
  );
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const baseUrl = buildBaseUrl(req);

  if (req.method === "GET" && url.pathname === "/") {
    sendJson(res, 200, {
      name: "SnapFlash API",
      docsUrl: `${baseUrl}/api-docs`,
      openApiUrl: `${baseUrl}/openapi.json`,
      collection: "flashcards",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/openapi.json") {
    sendJson(res, 200, buildOpenApiDocument(baseUrl));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api-docs") {
    sendHtml(res, 200, buildSwaggerHtml());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/flashcards") {
    const deck = url.searchParams.get("deck");
    const mastered = parseMasteredQuery(url.searchParams.get("mastered"));
    const items = listFlashcards({ deck, mastered });

    sendJson(res, 200, {
      items,
      total: items.length,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/flashcards") {
    const payload = await readJsonBody(req);
    const dto = validateCreateFlashcardDto(payload);
    sendJson(res, 201, createFlashcard(dto));
    return;
  }

  const flashcardId = parseFlashcardId(url.pathname);
  if (flashcardId !== null) {
    if (req.method === "GET") {
      const flashcard = getFlashcardById(flashcardId);
      if (!flashcard) {
        throw createHttpError(404, "Flashcard not found.");
      }

      sendJson(res, 200, flashcard);
      return;
    }

    if (req.method === "PUT") {
      const payload = await readJsonBody(req);
      const dto = validateUpdateFlashcardDto(payload);
      sendJson(res, 200, updateFlashcard(flashcardId, dto));
      return;
    }

    if (req.method === "DELETE") {
      deleteFlashcard(flashcardId);
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }
  }

  throw createHttpError(404, "Route not found.");
}

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error(error);
    }

    sendJson(res, statusCode, {
      message: error.message || "Internal server error.",
    });
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`SnapFlash API listening on http://${HOST}:${PORT}`);
    console.log(`OpenAPI JSON: http://${HOST}:${PORT}/openapi.json`);
    console.log(`Swagger UI: http://${HOST}:${PORT}/api-docs`);
  });
}

module.exports = {
  buildOpenApiDocument,
  createFlashcard,
  deleteFlashcard,
  getFlashcardById,
  handleRequest,
  listFlashcards,
  server,
  updateFlashcard,
  validateCreateFlashcardDto,
  validateUpdateFlashcardDto,
};
