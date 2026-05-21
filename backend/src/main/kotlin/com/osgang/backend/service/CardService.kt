package com.osgang.backend.service

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.response.LearningJourneyResponse
import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.repository.DeckRepository
import com.osgang.backend.repository.FlashcardRepository
import com.osgang.backend.repository.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*

@Service
class CardService(
    private val flashcardRepository: FlashcardRepository,
    private val deckRepository: DeckRepository,
    private val userRepository: UserRepository
) {
    fun findAllCardsByDeckId(deckId: UUID): List<Flashcard> {
        return flashcardRepository.findByDeckDeckId(deckId)
    }

    fun getDeck(deckId: UUID): Deck {
        return deckRepository.findByIdOrNull(deckId)
            ?: throw AppException(ErrorCode.DECK__DECK_NOT_FOUND)
    }

    fun findAllCardsByUserId(userId: UUID): List<Flashcard> {
        return flashcardRepository.findByDeckUserUserId(userId)
    }

    fun getLearningJourney(userId: UUID): LearningJourneyResponse {
        val cards = findAllCardsByUserId(userId)
        val (mastered, learning) = cards.partition { it.flipCount <= 2 }

        return LearningJourneyResponse(
            mastered = mastered,
            learning = learning
        )
    }

    fun saveCard(request: CardCreationRequest): Flashcard {
        val deck = deckRepository.findByIdOrNull(request.deckId)
            ?: throw AppException(ErrorCode.DECK__DECK_NOT_FOUND)

        val card = Flashcard(
            deck,
            request.word,
            request.translation,
            request.definition,
        )

        return flashcardRepository.save(card)
    }

    fun createDeck(userId: UUID, request: DeckCreationRequest): Deck {
        val deck = Deck(
            userRepository.findByUserId(userId) ?: throw AppException(ErrorCode.USER__USER_NOT_FOUND),
            request.deckName,
            request.description
        )

        return deckRepository.save(deck)
    }

    fun updateFlipCount(cardId: UUID, newFlipCount: Int): Flashcard {
        val card = flashcardRepository.findByIdOrNull(cardId)
            ?: throw AppException(ErrorCode.CARD__CARD_NOT_FOUND)
        card.flipCount = newFlipCount
        return flashcardRepository.save(card)
    }

    fun findAllDecksByUserId(userId: UUID): List<Deck> {
        return deckRepository.findByUserUserId(userId)
    }
}
