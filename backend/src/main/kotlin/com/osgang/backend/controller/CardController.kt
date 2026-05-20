package com.osgang.backend.controller

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
//import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/card")
class CardController(
    private val userService: UserService,
    private val cardService: CardService,
    private val authenticationService: AuthenticationService
) {
    @PostMapping("/new")
    fun requestNewCard(
        @RequestBody request: CardCreationRequest
    ): ApiResponse<Flashcard> {
        val deck = cardService.getDeck(request.deckId)

        val card = Flashcard(
            deck,
            request.word,
            request.translation,
            request.definition,
        )

        return ApiResponse(result = cardService.saveCard(card))
    }
}