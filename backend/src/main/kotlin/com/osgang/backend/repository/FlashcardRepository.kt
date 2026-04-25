package com.osgang.backend.repository

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface FlashcardRepository : JpaRepository<Flashcard, UUID> {
    
    // Fetch all flashcards inside a specific deck using the deck's UUID
    fun findByDeckDeckId(deckId: UUID): List<Flashcard>
    
    // Alternatively, fetch passing the whole Deck entity
    fun findByDeck(deck: Deck): List<Flashcard>
}