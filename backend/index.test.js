"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildOpenApiDocument,
  createFlashcard,
  deleteFlashcard,
  getFlashcardById,
  listFlashcards,
  updateFlashcard,
  validateCreateFlashcardDto,
  validateUpdateFlashcardDto,
} = require("./index");

test("CreateFlashcardDto validates required fields", () => {
  const dto = validateCreateFlashcardDto({
    term: " sustainable ",
    definition: " able to continue over time ",
  });

  assert.equal(dto.term, "sustainable");
  assert.equal(dto.definition, "able to continue over time");
  assert.equal(dto.sourceLanguage, "en");
  assert.equal(dto.targetLanguage, "vi");
  assert.equal(dto.deck, "default");
  assert.equal(dto.mastered, false);
});

test("flashcards CRUD flow works end to end", () => {
  const created = createFlashcard(
    validateCreateFlashcardDto({
      term: "ecosystem",
      definition: "a community of living things and their environment",
      example: "The rainforest is a complex ecosystem.",
      deck: "biology",
      mastered: false,
    }),
  );

  assert.ok(created.id > 0);
  assert.equal(created.term, "ecosystem");

  const loaded = getFlashcardById(created.id);
  assert.equal(loaded.id, created.id);

  const updated = updateFlashcard(
    created.id,
    validateUpdateFlashcardDto({
      definition: "a system formed by living organisms and their environment",
      mastered: true,
    }),
  );

  assert.equal(updated.mastered, true);
  assert.match(updated.definition, /system formed/);

  const list = listFlashcards({ deck: "biology", mastered: null });
  assert.ok(list.some((item) => item.id === created.id));

  deleteFlashcard(created.id);
  assert.equal(getFlashcardById(created.id), null);
});

test("OpenAPI document exposes flashcards CRUD and DTO schemas", () => {
  const document = buildOpenApiDocument("https://snapflash.example.com");

  assert.equal(document.openapi, "3.0.3");
  assert.ok(document.paths["/api/flashcards"]);
  assert.ok(document.paths["/api/flashcards/{id}"]);
  assert.ok(document.components.schemas.CreateFlashcardDto);
  assert.ok(document.components.schemas.UpdateFlashcardDto);
  assert.ok(document.components.schemas.FlashcardResponseDto);
});
