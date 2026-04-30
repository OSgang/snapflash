package com.osgang.backend.controller

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jdk.jfr.Description
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/card")
class CardController(
    private val userService: UserService,
    private val cardService: CardService,
) {
    @PostMapping("new")
    fun requestNewCard(@CookieValue("user_id") userId: UUID, @RequestBody cardReq: CardCreationRequest): ResponseEntity<String> {

        val deck = cardService.getDeck(cardReq.deckId) ?:
            return ResponseEntity.badRequest().body("Invalid UUID for deck doesn't exist.")

        val card = Flashcard(
            deck,
            cardReq.word,
            cardReq.translation,
            cardReq.definition,
        )

        return ResponseEntity.ok(cardService.saveCard(card).flashcardId.toString())
    }
}