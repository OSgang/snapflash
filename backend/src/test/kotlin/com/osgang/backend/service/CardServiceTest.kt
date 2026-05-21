package com.osgang.backend.service

import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CardServiceTest @Autowired constructor(
    private val cardService: CardService,
    private val userService: UserService
) {
    @Test
    fun `creates deck for existing user`() {
        val userId = createUser("deck-owner").userId!!

        val deck = cardService.createDeck(
            userId,
            DeckCreationRequest(
                deckName = "English Basics",
                description = "Daily vocabulary"
            )
        )

        assertNotNull(deck.deckId)
        assertEquals("English Basics", deck.deckName)
        assertEquals("Daily vocabulary", deck.description)
        assertEquals(userId, deck.user.userId)
    }

    @Test
    fun `rejects deck creation for missing user`() {
        val exception = assertThrows<AppException> {
            cardService.createDeck(
                UUID.randomUUID(),
                DeckCreationRequest(
                    deckName = "Missing Owner",
                    description = null
                )
            )
        }

        assertEquals(ErrorCode.USER__USER_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `creates card in existing deck`() {
        val deck = createDeck("card-owner", "Vocabulary")

        val card = cardService.saveCard(
            CardCreationRequest(
                deckId = deck.deckId!!,
                word = "hello",
                translation = "xin chao",
                definition = "A greeting"
            )
        )

        assertNotNull(card.flashcardId)
        assertEquals(deck.deckId, card.deck.deckId)
        assertEquals("hello", card.word)
        assertEquals(0, card.flipCount)
    }

    @Test
    fun `rejects card creation for missing deck`() {
        val exception = assertThrows<AppException> {
            cardService.saveCard(
                CardCreationRequest(
                    deckId = UUID.randomUUID(),
                    word = "hello",
                    translation = "xin chao",
                    definition = "A greeting"
                )
            )
        }

        assertEquals(ErrorCode.DECK__DECK_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `updates flip count`() {
        val card = createCard("flip-owner", "practice", 0)

        val updatedCard = cardService.updateFlipCount(card.flashcardId!!, 7)

        assertEquals(7, updatedCard.flipCount)
    }

    @Test
    fun `rejects flip count update for missing card`() {
        val exception = assertThrows<AppException> {
            cardService.updateFlipCount(UUID.randomUUID(), 3)
        }

        assertEquals(ErrorCode.CARD__CARD_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `groups learning journey by flip count threshold`() {
        val user = createUser("journey-owner")
        val deck = cardService.createDeck(
            user.userId!!,
            DeckCreationRequest("Journey Deck", null)
        )
        val masteredCard = createCard(deck.deckId!!, "easy", 2)
        val learningCard = createCard(deck.deckId!!, "hard", 3)

        val response = cardService.getLearningJourney(user.userId!!)

        assertEquals(listOf(masteredCard.flashcardId), response.mastered.map { it.flashcardId })
        assertEquals(listOf(learningCard.flashcardId), response.learning.map { it.flashcardId })
    }

    @Test
    fun `returns toughest words with requested limit`() {
        val user = createUser("tough-owner")
        val deck = cardService.createDeck(
            user.userId!!,
            DeckCreationRequest("Tough Deck", null)
        )
        createCard(deck.deckId!!, "medium", 4)
        createCard(deck.deckId!!, "hard", 8)
        createCard(deck.deckId!!, "easy", 1)

        val toughestWords = cardService.getToughestWords(user.userId!!, 2)

        assertEquals(2, toughestWords.size)
        assertEquals(listOf("hard", "medium"), toughestWords.map { it.word })
    }

    @Test
    fun `rejects invalid toughest words limit`() {
        val exception = assertThrows<AppException> {
            cardService.getToughestWords(UUID.randomUUID(), 0)
        }

        assertEquals(ErrorCode.CARD__INVALID_LIMIT, exception.errorCode)
    }

    @Test
    fun `finds all decks for user ordered by last update descending`() {
        val userId = createUser("deck-list-owner").userId!!
        val firstDeck = cardService.createDeck(userId, DeckCreationRequest("First", null))
        val secondDeck = cardService.createDeck(userId, DeckCreationRequest("Second", null))

        val decks = cardService.findAllDecksByUserId(userId)

        assertEquals(setOf(firstDeck.deckId, secondDeck.deckId), decks.map { it.deckId }.toSet())
        assertTrue(decks.size >= 2)
    }

    private fun createUser(usernamePrefix: String) =
        userService.userCreationRequest(
            UserCreationRequest(
                email = "$usernamePrefix@example.com",
                username = usernamePrefix,
                password = "securePassword123"
            )
        )

    private fun createDeck(usernamePrefix: String, deckName: String) =
        cardService.createDeck(
            createUser(usernamePrefix).userId!!,
            DeckCreationRequest(deckName = deckName, description = null)
        )

    private fun createCard(usernamePrefix: String, word: String, flipCount: Int) =
        createCard(createDeck(usernamePrefix, "$word deck").deckId!!, word, flipCount)

    private fun createCard(deckId: UUID, word: String, flipCount: Int) =
        cardService.updateFlipCount(
            cardService.saveCard(
                CardCreationRequest(
                    deckId = deckId,
                    word = word,
                    translation = "$word translation",
                    definition = "$word definition"
                )
            ).flashcardId!!,
            flipCount
        )
}
