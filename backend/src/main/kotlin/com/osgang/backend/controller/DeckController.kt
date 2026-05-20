package com.osgang.backend.controller

import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import com.osgang.backend.service.AuthenticationService
//import org.flywaydb.core.api.ErrorCode
//import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*


@RestController
@RequestMapping("/deck")
class DeckController(
    private val userService: UserService,
    private val cardService: CardService,
    private val authenticationService: AuthenticationService
) {
    @GetMapping("/all")
    fun requestDecksByUserId(
        @RequestHeader("Authorization") authorizationHeader: String
    ): ApiResponse<List<Deck>> {
        val jwtToken = authorizationHeader.replace("Bearer ", "")
        val userId = UUID.fromString(authenticationService.extractUserId(jwtToken))

        return ApiResponse(result = cardService.findAllDecksByUserId(userId))
    }

    @GetMapping("/{deckId}")
    fun requestCardsByDeckId(@PathVariable deckId: UUID): ApiResponse<List<Flashcard>> {
        return ApiResponse(result = cardService.findAllCardsByDeckId(deckId))
    }

    @PostMapping("/new")
    fun requestNewDeck(
        @RequestHeader("Authorization") authorizationHeader: String,
        @RequestBody request: DeckCreationRequest
    ): ApiResponse<Deck> {
        val jwtToken = authorizationHeader.replace("Bearer ", "")
        val userId = UUID.fromString(authenticationService.extractUserId(jwtToken))

        println("JWT token: $jwtToken")
        println("User id: $userId")

        return ApiResponse(result = cardService.createDeck(userId, request))
    }
}