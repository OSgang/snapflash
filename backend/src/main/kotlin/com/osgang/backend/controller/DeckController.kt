package com.osgang.backend.controller

import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.Deck
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*


@RestController
@RequestMapping("/deck")
class DeckController(
    private val userService: UserService,
    private val deckService: CardService,
) {
    @GetMapping("/all")
    fun requestDecksByUserId(@CookieValue("user_id") userId: UUID): ApiResponse<List<Deck>> {
//        return runCatching {
//            ResponseEntity.ok(deckService.findAllDecksByUserId(userId))
//        }.getOrElse {
//            ResponseEntity.status(404).build()
//        }
        return deckService.findAllDecksByUserId(userId);
    }

    @GetMapping("/{deckId}")
    fun requestCardsByDeckId(@PathVariable deckId: UUID): ApiResponse<Deck> {
//        return ResponseEntity.ok(runCatching { deckService.getDeck(deckId) }.getOrElse {
//            return ResponseEntity.notFound().build()
//        })
    }

    @PostMapping("/new")
    fun requestNewDeck(
        @CookieValue("user_id") userId: UUID,
        @RequestBody deckReq: DeckCreationRequest
    ): ApiResponse<String> {
        val deck = Deck(
            userService.getUserById(userId) ?: return ResponseEntity.status(404)
                .body("Invalid UUID or user does not exist"),
            deckReq.deckName,
            deckReq.description
        )

        return ResponseEntity.ok(deckService.saveDeck(deck).deckId.toString())
    }
}