package com.osgang.backend.repository

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface DeckRepository : JpaRepository<Deck, UUID> {

    // Fetch all decks belonging to a specific user using the user's UUID
    fun findByUserUserId(userId: UUID): List<Deck>

    // Alternatively, fetch passing the whole User entity
    fun findByUser(user: User): List<Deck>
}