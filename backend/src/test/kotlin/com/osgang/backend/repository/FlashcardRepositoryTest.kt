package com.osgang.backend.repository

import com.osgang.backend.entity.Deck
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.entity.User
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FlashcardRepositoryTest @Autowired constructor(
    private val userRepository: UserRepository,
    private val deckRepository: DeckRepository,
    private val flashcardRepository: FlashcardRepository
) {
    @Test
    fun `saves flashcard with generated timestamps and default flip count`() {
        val deck = createDeck("flashcard-repository-owner", "Repository Cards")

        val flashcard = flashcardRepository.saveAndFlush(
            Flashcard(
                deck = deck,
                word = "hello",
                translation = "xin chao",
                definition = "A greeting"
            )
        )

        assertNotNull(flashcard.flashcardId)
        assertNotNull(flashcard.createdAt)
        assertNotNull(flashcard.lastUpdate)
        assertEquals(0, flashcard.flipCount)
        assertEquals(deck.deckId, flashcard.deck.deckId)
    }

    @Test
    fun `finds flashcards by deck id and deck entity`() {
        val deck = createDeck("flashcard-repository-deck-owner", "Deck Lookup")
        val card = flashcardRepository.saveAndFlush(createFlashcard(deck, "apple", 0))

        assertEquals(listOf(card.flashcardId), flashcardRepository.findByDeckDeckId(deck.deckId!!).map { it.flashcardId })
        assertEquals(listOf(card.flashcardId), flashcardRepository.findByDeck(deck).map { it.flashcardId })
    }

    @Test
    fun `finds flashcards by owning user id`() {
        val ownerDeck = createDeck("flashcard-repository-user-owner", "Owner Deck")
        val otherDeck = createDeck("flashcard-repository-other-owner", "Other Deck")
        val ownerCard = flashcardRepository.saveAndFlush(createFlashcard(ownerDeck, "owner", 0))
        flashcardRepository.saveAndFlush(createFlashcard(otherDeck, "other", 0))

        assertEquals(
            listOf(ownerCard.flashcardId),
            flashcardRepository.findByDeckUserUserId(ownerDeck.user.userId!!).map { it.flashcardId }
        )
    }

    @Test
    fun `finds flashcard by flashcard id`() {
        val deck = createDeck("flashcard-repository-id-owner", "Id Deck")
        val card = flashcardRepository.saveAndFlush(createFlashcard(deck, "identifier", 0))

        assertEquals(card.flashcardId, flashcardRepository.findByFlashcardId(card.flashcardId!!).flashcardId)
    }

    @Test
    fun `finds toughest flashcards by user ordered by flip count and last update`() {
        val deck = createDeck("flashcard-repository-tough-owner", "Tough Deck")
        flashcardRepository.saveAndFlush(createFlashcard(deck, "easy", 1))
        val olderHardCard = flashcardRepository.saveAndFlush(createFlashcard(deck, "older-hard", 8))
        Thread.sleep(5)
        val newerHardCard = flashcardRepository.saveAndFlush(createFlashcard(deck, "newer-hard", 8))

        val toughestCards = flashcardRepository.findByDeckUserUserIdOrderByFlipCountDescLastUpdateDesc(
            deck.user.userId!!,
            PageRequest.of(0, 2)
        )

        assertEquals(listOf(newerHardCard.flashcardId, olderHardCard.flashcardId), toughestCards.map { it.flashcardId })
    }

    private fun createDeck(username: String, deckName: String): Deck {
        val user = userRepository.saveAndFlush(
            User(
                email = "$username@example.com",
                username = username,
                passwordHash = "hashed-password"
            )
        )

        return deckRepository.saveAndFlush(Deck(user, deckName, null))
    }

    private fun createFlashcard(deck: Deck, word: String, flipCount: Int): Flashcard =
        Flashcard(
            deck = deck,
            word = word,
            translation = "$word translation",
            definition = "$word definition",
            flipCount = flipCount
        )
}
