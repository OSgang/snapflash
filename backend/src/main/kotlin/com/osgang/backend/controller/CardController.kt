package com.osgang.backend.controller

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.request.CardFlipUpdateRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.dto.response.CardFlipUpdateResponse
import com.osgang.backend.dto.response.LearningJourneyResponse
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
        return ApiResponse(result = cardService.saveCard(request))
    }

    @PatchMapping("/update-flip-count")
    fun updateFlipCount(@RequestBody req: List<CardFlipUpdateRequest>): ApiResponse<List<CardFlipUpdateResponse>> {
        val list = mutableListOf<CardFlipUpdateResponse>()

        for (element in req) {
            val card = cardService.updateFlipCount(element.cardId, element.flipCount)
            list.add(CardFlipUpdateResponse(card.deck.deckId!!, card.flashcardId!!, card.flipCount))
        }

        return ApiResponse(result = list)
    }

    @GetMapping("/learning-journey")
    fun getLearningJourney(
        @RequestHeader("Authorization") authorizationHeader: String
    ): ApiResponse<LearningJourneyResponse> {
        val jwtToken = authorizationHeader.replace("Bearer ", "")
        val userId = UUID.fromString(authenticationService.extractUserId(jwtToken))

        return ApiResponse(result = cardService.getLearningJourney(userId))
    }
}
