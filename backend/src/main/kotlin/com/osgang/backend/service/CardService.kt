package com.osgang.backend.service

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.repository.DeckRepository
import com.osgang.backend.repository.FlashcardRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CardService(
    private val flashcardRepository: FlashcardRepository,
    private val deckRepository: DeckRepository
) {
    fun findAllCardsByDeckId(deckId: UUID): List<Flashcard> {
        return flashcardRepository.findByDeckDeckId(deckId)
    }

    fun getDeck(deckId: UUID): Deck? {
        return deckRepository.getReferenceById(deckId)
    }

    fun findAllCardsByUserId(userId: UUID): List<Flashcard> {

        val decks = this.findAllDecksByUserId(userId)
        val cards: MutableList<Flashcard> = mutableListOf()

        for (deck in decks) {
            cards += this.findAllCardsByUserId(requireNotNull(deck.deckId))
        }

        return cards
    }

    fun saveCard(card: Flashcard): Flashcard {
        return flashcardRepository.save(card)
    }

    fun saveDeck(deck: Deck): Deck {
        return deckRepository.save(deck)
    }

    fun findAllDecksByUserId(userId: UUID): List<Deck> {
        return deckRepository.findByUserUserId(userId)
    }
}