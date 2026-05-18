package com.osgang.backend.controller

import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.exception.AppException
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import com.osgang.backend.exception.ErrorCode
//import org.flywaydb.core.api.ErrorCode
//import org.springframework.http.ResponseEntity
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
        return ApiResponse(result = deckService.findAllDecksByUserId(userId))
    }

    @GetMapping("/{deckId}")
    fun requestCardsByDeckId(@PathVariable deckId: UUID): ApiResponse<List<Flashcard>> {
//        return ResponseEntity.ok(runCatching { deckService.getDeck(deckId) }.getOrElse {
//            return ResponseEntity.notFound().build()
//        })
        return ApiResponse(result = deckService.findAllCardsByDeckId(deckId))
    }

    @PostMapping("/new")
    fun requestNewDeck(
        @CookieValue("user_id") userId: UUID,
        @RequestBody deckReq: DeckCreationRequest
    ): ApiResponse<Deck> {
        val deck = Deck(
            userService.getUserById(userId) ?: throw AppException(ErrorCode.USER__USER_NOT_FOUND),
            deckReq.deckName,
            deckReq.description
        )
//
//        return ResponseEntity.ok(deckService.saveDeck(deck).deckId.toString())


//        val deck = deckService.getDeck() ?: throw AppException(com.osgang.backend.exception.ErrorCode.DECK__DECK_NOT_FOUND)
//
//        val card = Flashcard(
//            deck,
//            cardReq.word,
//            cardReq.translation,
//            cardReq.definition,
//        )
//
//        return ApiResponse(result = cardService.saveCard(card))

        return ApiResponse(result = deckService.saveDeck(deck))
    }
}