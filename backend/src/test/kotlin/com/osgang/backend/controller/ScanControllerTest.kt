package com.osgang.backend.controller

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.UserService
import kotlin.test.Test
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpHeaders
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ScanControllerTest @Autowired constructor(
    private val webApplicationContext: WebApplicationContext,
    private val userService: UserService,
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
    fun `lookup rejects missing token`() {
        mockMvc.perform(get("/lookup").param("word", "a"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `scan rejects missing token`() {
        mockMvc.perform(
            multipart("/scan")
                .file("multipartFile", "not-an-image".toByteArray())
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `lookup returns dictionary results for authenticated user`() {
        val user = createUser("lookupowner")

        mockMvc.perform(
            get("/lookup")
                .param("word", "a")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(user))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").isNotEmpty)
    }

    @Test
    fun `lookup returns empty list for unknown word`() {
        val user = createUser("lookupmissingowner")

        mockMvc.perform(
            get("/lookup")
                .param("word", "word-that-does-not-exist")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(user))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.length()").value(0))
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
