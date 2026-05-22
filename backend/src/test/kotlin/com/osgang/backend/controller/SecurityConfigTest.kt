package com.osgang.backend.controller

import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.JWSObject
import com.nimbusds.jose.Payload
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jwt.JWTClaimsSet
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.UserService
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date
import kotlin.test.Test
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpHeaders
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SecurityConfigTest @Autowired constructor(
    private val webApplicationContext: WebApplicationContext,
    private val userService: UserService,
    private val authenticationService: AuthenticationService,
    @Value("\${JWT_SIGNER_KEY}") private val signerKey: String
) {
    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .build()
    }

    @Test
    fun `greet endpoint allows anonymous access`() {
        mockMvc.perform(get("/user/greet"))
            .andExpect(status().isOk)
    }

    @Test
    fun `login endpoint allows anonymous access`() {
        mockMvc.perform(
            post("/user/login")
                .contentType("application/json")
                .content("""{"username":"missing-security-user","password":"securePassword123"}""")
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `protected endpoint rejects missing authorization header`() {
        mockMvc.perform(get("/deck/all"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `protected endpoint rejects malformed bearer token`() {
        mockMvc.perform(
            get("/deck/all")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-jwt")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `protected endpoint accepts valid bearer token`() {
        val user = createUser("securityvaliduser")

        mockMvc.perform(
            get("/deck/all")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(user))
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `protected endpoint rejects signed token with non uuid subject`() {
        val token = generateTokenWithSubject("not-a-user-id")

        mockMvc.perform(
            get("/deck/all")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $token")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `lookup endpoint requires authentication`() {
        mockMvc.perform(get("/lookup").param("word", "a"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `lookup endpoint accepts valid bearer token`() {
        val user = createUser("securitylookupuser")

        mockMvc.perform(
            get("/lookup")
                .param("word", "a")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(user))
        )
            .andExpect(status().isOk)
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

    private fun generateTokenWithSubject(subject: String): String {
        val claimsSet = JWTClaimsSet.Builder()
            .subject(subject)
            .issuer("osgang.com")
            .issueTime(Date())
            .expirationTime(Date(Instant.now().plus(4, ChronoUnit.HOURS).toEpochMilli()))
            .build()

        val jwsObject = JWSObject(
            JWSHeader(JWSAlgorithm.HS256),
            Payload(claimsSet.toJSONObject())
        )

        jwsObject.sign(MACSigner(signerKey.toByteArray()))

        return jwsObject.serialize()
    }
}
