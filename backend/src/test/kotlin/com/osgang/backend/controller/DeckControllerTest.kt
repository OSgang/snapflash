package com.osgang.backend.controller

import tools.jackson.databind.ObjectMapper
import com.osgang.backend.dto.request.CardCreationRequest
import com.osgang.backend.dto.request.DeckCreationRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.CardService
import com.osgang.backend.service.UserService
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DeckControllerTest @Autowired constructor(
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
    fun `deck all rejects missing token`() {
        mockMvc.perform(get("/deck/all"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `deck new rejects missing token`() {
        mockMvc.perform(
            post("/deck/new")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(DeckCreationRequest("No Auth", null)))
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `deck all returns decks for authenticated user`() {
        val owner = createUser("deckallowner")
        val otherUser = createUser("deckallother")
        cardService.createDeck(owner.userId!!, DeckCreationRequest("Owner Deck One", null))
        cardService.createDeck(owner.userId!!, DeckCreationRequest("Owner Deck Two", "owned"))
        cardService.createDeck(otherUser.userId!!, DeckCreationRequest("Other Deck", null))

        mockMvc.perform(
            get("/deck/all")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").value(2))
            .andExpect(jsonPath("$.result[?(@.deckName == 'Owner Deck One')]").exists())
            .andExpect(jsonPath("$.result[?(@.deckName == 'Owner Deck Two')]").exists())
    }

    @Test
    fun `deck new creates deck for authenticated user`() {
        val owner = createUser("decknewowner")

        mockMvc.perform(
            post("/deck/new")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        DeckCreationRequest(
                            deckName = "Created From API",
                            description = "created through controller"
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.deckName").value("Created From API"))
            .andExpect(jsonPath("$.result.description").value("created through controller"))
    }

    @Test
    fun `deck by id returns flashcards in deck`() {
        val owner = createUser("deckdetailowner")
        val deck = cardService.createDeck(owner.userId!!, DeckCreationRequest("Detail Deck", null))
        cardService.saveCard(
            CardCreationRequest(
                deckId = deck.deckId!!,
                word = "hello",
                translation = "xin chao",
                definition = "A greeting"
            )
        )

        mockMvc.perform(
            get("/deck/${deck.deckId}")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(owner))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").value(1))
            .andExpect(jsonPath("$.result[0].word").value("hello"))
    }

    private fun createUser(username: String): User =
        userService.userCreationRequest(
            UserCreationRequest(
                email = "$username@example.com",
                username = username,
                password = "securePassword123"
            )
        )

    private fun bearerToken(user: User): String =
        "Bearer ${authenticationService.generateJWTToken(user.userId!!)}"
}
