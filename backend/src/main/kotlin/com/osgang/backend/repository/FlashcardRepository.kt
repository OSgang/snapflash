package com.osgang.backend.repository

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface FlashcardRepository : JpaRepository<Flashcard, UUID> {

    // Fetch all flashcards inside a specific deck using the deck's UUID
    fun findByDeckDeckId(deckId: UUID): List<Flashcard>

    // Fetch all flashcards that belong to any deck owned by a specific user.
    fun findByDeckUserUserId(userId: UUID): List<Flashcard>

    fun findByFlashcardId(flashcardId: UUID): Flashcard

    // Alternatively, fetch passing the whole Deck entity
    fun findByDeck(deck: Deck): List<Flashcard>
}
