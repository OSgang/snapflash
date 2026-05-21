package com.osgang.backend.controller

import tools.jackson.databind.ObjectMapper
import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.IntrospectRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.UserService
import kotlin.test.Test
import org.hamcrest.Matchers.emptyString
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
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
class UserControllerTest @Autowired constructor(
    private val webApplicationContext: WebApplicationContext,
    private val objectMapper: ObjectMapper,
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
    fun `register creates user and returns response wrapper`() {
        mockMvc.perform(
            post("/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        UserCreationRequest(
                            email = "register@example.com",
                            username = "registeruser",
                            password = "securePassword123"
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("Success"))
            .andExpect(jsonPath("$.result.email").value("register@example.com"))
            .andExpect(jsonPath("$.result.username").value("registeruser"))
            .andExpect(jsonPath("$.result.passwordHash").doesNotExist())
    }

    @Test
    fun `register rejects duplicate email`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "duplicate-controller@example.com",
                username = "firstcontroller",
                password = "securePassword123"
            )
        )

        mockMvc.perform(
            post("/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        UserCreationRequest(
                            email = "duplicate-controller@example.com",
                            username = "secondcontroller",
                            password = "securePassword456"
                        )
                    )
                )
        )
            .andExpect(status().isConflict)
            .andExpect(content().string("A user with this email already exists"))
    }

    @Test
    fun `login returns jwt for valid credentials`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "login-controller@example.com",
                username = "logincontroller",
                password = "securePassword123"
            )
        )

        mockMvc.perform(
            post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        AuthenticationRequest(
                            username = "logincontroller",
                            password = "securePassword123"
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.username").value("logincontroller"))
            .andExpect(jsonPath("$.result.isAuthenticated").value(true))
            .andExpect(jsonPath("$.result.jwtToken", not(emptyString())))
    }

    @Test
    fun `login rejects wrong password`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "wrong-controller@example.com",
                username = "wrongcontroller",
                password = "securePassword123"
            )
        )

        mockMvc.perform(
            post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        AuthenticationRequest(
                            username = "wrongcontroller",
                            password = "badPassword"
                        )
                    )
                )
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().string("Wrong password"))
    }

    @Test
    fun `login rejects missing user`() {
        mockMvc.perform(
            post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        AuthenticationRequest(
                            username = "missingcontroller",
                            password = "securePassword123"
                        )
                    )
                )
        )
            .andExpect(status().isNotFound)
            .andExpect(content().string("User not found"))
    }

    @Test
    fun `introspect returns valid for generated token`() {
        val token = authenticationService.generateJWTToken(java.util.UUID.randomUUID())

        mockMvc.perform(
            post("/user/introspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(IntrospectRequest(token)))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.result.isValid").value(true))
    }

    @Test
    fun `greet endpoint is public`() {
        mockMvc.perform(get("/user/greet"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
    }
}
