package com.osgang.backend.controller

import tools.jackson.databind.ObjectMapper
import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.request.CardFlipUpdateRequest
import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.Flashcard
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
import java.util.UUID
import kotlin.test.Test
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CardControllerTest @Autowired constructor(
    private val webApplicationContext: WebApplicationContext,
    private val objectMapper: ObjectMapper,
    private val userService: UserService,
    private val cardService: CardService,
    private val authenticationService: AuthenticationService
) {
    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .build()
    }

    @Test
    fun `card new rejects missing token`() {
        mockMvc.perform(
            post("/card/new")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        CardCreationRequest(
                            deckId = UUID.randomUUID(),
                            word = "hello",
                            translation = "xin chao",
                            definition = "A greeting"
                        )
                    )
                )
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `card new creates flashcard`() {
        val owner = createUser("cardnewowner")
        val deck = cardService.createDeck(owner.userId!!, DeckCreationRequest("Cards", null))

        mockMvc.perform(
            post("/card/new")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        CardCreationRequest(
                            deckId = deck.deckId!!,
                            word = "hello",
                            translation = "xin chao",
                            definition = "A greeting"
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.word").value("hello"))
            .andExpect(jsonPath("$.result.translation").value("xin chao"))
            .andExpect(jsonPath("$.result.flipCount").value(0))
    }

    @Test
    fun `card new rejects missing deck`() {
        val owner = createUser("cardmissingdeckowner")

        mockMvc.perform(
            post("/card/new")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        CardCreationRequest(
                            deckId = UUID.randomUUID(),
                            word = "hello",
                            translation = "xin chao",
                            definition = "A greeting"
                        )
                    )
                )
        )
            .andExpect(status().isNotFound)
            .andExpect(content().string("Deck not found"))
    }

    @Test
    fun `update flip count updates multiple cards`() {
        val owner = createUser("flipapiowner")
        val deck = cardService.createDeck(owner.userId!!, DeckCreationRequest("Flip Deck", null))
        val firstCard = createCard(deck.deckId!!, "first", 0)
        val secondCard = createCard(deck.deckId!!, "second", 0)

        mockMvc.perform(
            patch("/card/update-flip-count")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        listOf(
                            CardFlipUpdateRequest(firstCard.flashcardId!!, 3),
                            CardFlipUpdateRequest(secondCard.flashcardId!!, 5)
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").value(2))
            .andExpect(jsonPath("$.result[0].flipCount").value(3))
            .andExpect(jsonPath("$.result[1].flipCount").value(5))
    }

    @Test
    fun `update flip count rejects missing card`() {
        val owner = createUser("flipmissingowner")

        mockMvc.perform(
            patch("/card/update-flip-count")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listOf(CardFlipUpdateRequest(UUID.randomUUID(), 3))))
        )
            .andExpect(status().isNotFound)
            .andExpect(content().string("Card not found"))
    }

    @Test
    fun `learning journey groups cards for authenticated user`() {
        val owner = createUser("journeyapiowner")
        val deck = cardService.createDeck(owner.userId!!, DeckCreationRequest("Journey Deck", null))
        createCard(deck.deckId!!, "mastered", 2)
        createCard(deck.deckId!!, "learning", 4)

        mockMvc.perform(
            get("/card/learning-journey")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.mastered.length()").value(1))
            .andExpect(jsonPath("$.result.mastered[0].word").value("mastered"))
            .andExpect(jsonPath("$.result.learning.length()").value(1))
            .andExpect(jsonPath("$.result.learning[0].word").value("learning"))
    }

    @Test
    fun `toughest words respects limit and sort order`() {
        val owner = createUser("toughapiowner")
        val deck = cardService.createDeck(owner.userId!!, DeckCreationRequest("Tough Deck", null))
        createCard(deck.deckId!!, "easy", 1)
        createCard(deck.deckId!!, "medium", 5)
        createCard(deck.deckId!!, "hard", 9)

        mockMvc.perform(
            get("/card/toughest-words")
                .param("limit", "2")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").value(2))
            .andExpect(jsonPath("$.result[0].word").value("hard"))
            .andExpect(jsonPath("$.result[1].word").value("medium"))
    }

    @Test
    fun `toughest words rejects invalid limit`() {
        val owner = createUser("toughinvalidowner")

        mockMvc.perform(
            get("/card/toughest-words")
                .param("limit", "0")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().string("Limit must be at least 1"))
    }

    private fun createUser(username: String): User =
        userService.userCreationRequest(
            UserCreationRequest(
                email = "$username@example.com",
                username = username,
                password = "securePassword123"
            )
        )

    private fun createCard(deckId: UUID, word: String, flipCount: Int): Flashcard =
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

    private fun bearerToken(user: User): String =
        "Bearer ${authenticationService.generateJWTToken(user.userId!!)}"
}
