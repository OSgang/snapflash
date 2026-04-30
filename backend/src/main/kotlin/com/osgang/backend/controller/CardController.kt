package com.osgang.backend.controller

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/card")
class CardController(
    private val userService: UserService,
    private val cardService: CardService,
) {
    @PostMapping("new")
    fun requestNewCard(
        @CookieValue("user_id") userId: UUID,
        @RequestBody cardReq: CardCreationRequest
    ): ResponseEntity<String> {

        val deck = cardService.getDeck(cardReq.deckId) ?: return ResponseEntity.badRequest()
            .body("Invalid UUID for deck doesn't exist.")

        val card = Flashcard(
            deck,
            cardReq.word,
            cardReq.translation,
            cardReq.definition,
        )

        return ResponseEntity.ok(cardService.saveCard(card).flashcardId.toString())
    }
}