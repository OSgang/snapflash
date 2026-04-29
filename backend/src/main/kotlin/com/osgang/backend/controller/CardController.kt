package com.osgang.backend.controller

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jdk.jfr.Description
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/card")
class CardController(
    private val userService: UserService,
    private val cardService: CardService,
) {
    @GetMapping("/decks")
    fun requestDecksByUserId(req: HttpServletRequest): ResponseEntity<List<Deck>> {
        req.cookies.find { it.name == "user_id" }?.let {
            val userId = UUID.fromString(it.value)
            return ResponseEntity.ok(cardService.findAllDecksByUserId(userId))
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build()
    }

    @GetMapping("/deck")
    fun requestCardsByDeckId(deckId: UUID): ResponseEntity<List<Flashcard>> {
        return ResponseEntity.ok(cardService.findAllCardsByDeckId(deckId))
    }

    @PostMapping("new-deck")
    fun requestNewDeck(req: HttpServletRequest): ResponseEntity<UUID> {
        try {
            req.cookies.find { it.name == "user_id" }?.let {
                val userId = UUID.fromString(it.value)

                val deck = Deck(
                    userService.getUserById(userId)!!,
                    req.getPart("name").inputStream.readAllBytes().decodeToString(),
                    req.getPart("description").inputStream.readAllBytes().decodeToString(),
                )

                return ResponseEntity.ok(cardService.saveDeck(deck).deckId)
            }
        } catch (e: Exception) {}

        return ResponseEntity.internalServerError().build()
    }
}