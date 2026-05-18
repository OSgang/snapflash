package com.osgang.backend.controller

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
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
) {
    @PostMapping("/new")
    fun requestNewCard(
        @CookieValue("user_id") userId: UUID,
        @RequestBody cardReq: CardCreationRequest
    ): ApiResponse<Flashcard> {

        //find USER ???
        val user = userService.getUserById(userId) ?: throw AppException(ErrorCode.USER__USER_NOT_FOUND)

        val deck = cardService.getDeck(cardReq.deckId) ?: throw AppException(ErrorCode.DECK__DECK_NOT_FOUND)

        val card = Flashcard(
            deck,
            cardReq.word,
            cardReq.translation,
            cardReq.definition,
        )

        return ApiResponse(result = cardService.saveCard(card))
    }
}