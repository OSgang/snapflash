package com.osgang.backend.repository

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.User
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DeckRepositoryTest @Autowired constructor(
    private val userRepository: UserRepository,
    private val deckRepository: DeckRepository
) {
    @Test
    fun `saves deck with generated timestamps`() {
        val user = createUser("deck-repository-owner")

        val deck = deckRepository.saveAndFlush(
            Deck(
                user = user,
                deckName = "Repository Deck",
                description = "Created in repository test"
            )
        )

        assertNotNull(deck.deckId)
        assertNotNull(deck.createdAt)
        assertNotNull(deck.lastUpdate)
        assertEquals(user.userId, deck.user.userId)
    }

    @Test
    fun `finds decks by user id and user entity`() {
        val owner = createUser("deck-repository-owner-one")
        val otherUser = createUser("deck-repository-owner-two")
        val ownerDeck = deckRepository.saveAndFlush(Deck(owner, "Owner Deck", null))
        deckRepository.saveAndFlush(Deck(otherUser, "Other Deck", null))

        assertEquals(listOf(ownerDeck.deckId), deckRepository.findByUserUserId(owner.userId!!).map { it.deckId })
        assertEquals(listOf(ownerDeck.deckId), deckRepository.findByUser(owner).map { it.deckId })
    }

    @Test
    fun `finds decks by user id ordered by last update descending`() {
        val owner = createUser("deck-repository-order-owner")
        val firstDeck = deckRepository.saveAndFlush(Deck(owner, "First Deck", null))
        Thread.sleep(5)
        val secondDeck = deckRepository.saveAndFlush(Deck(owner, "Second Deck", null))

        val decks = deckRepository.findByUserUserIdOrderByLastUpdateDesc(owner.userId!!)

        assertEquals(listOf(secondDeck.deckId, firstDeck.deckId), decks.map { it.deckId })
    }

    private fun createUser(username: String): User =
        userRepository.saveAndFlush(
            User(
                email = "$username@example.com",
                username = username,
                passwordHash = "hashed-password"
            )
        )
}
