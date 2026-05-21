package com.osgang.backend.service

import com.nimbusds.jwt.SignedJWT
import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.IntrospectRequest
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
class AuthenticationServiceTest @Autowired constructor(
    private val authenticationService: AuthenticationService,
    private val userService: UserService
) {
    @Test
    fun `authenticates valid credentials and returns jwt`() {
        val createdUser = userService.userCreationRequest(
            UserCreationRequest(
                email = "auth@example.com",
                username = "authuser",
                password = "securePassword123"
            )
        )

        val response = authenticationService.authenticate(
            AuthenticationRequest(
                username = "authuser",
                password = "securePassword123"
            )
        )

        val jwt = SignedJWT.parse(response.jwtToken)
        assertTrue(response.isAuthenticated)
        assertEquals("authuser", response.username)
        assertEquals(createdUser.userId.toString(), jwt.jwtClaimsSet.subject)
        assertNotNull(jwt.jwtClaimsSet.expirationTime)
    }

    @Test
    fun `rejects authentication for missing user`() {
        val exception = assertThrows<AppException> {
            authenticationService.authenticate(
                AuthenticationRequest(
                    username = "missinguser",
                    password = "securePassword123"
                )
            )
        }

        assertEquals(ErrorCode.USER__USER_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `rejects authentication with wrong password`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "auth-wrong@example.com",
                username = "authwrong",
                password = "securePassword123"
            )
        )

        val exception = assertThrows<AppException> {
            authenticationService.authenticate(
                AuthenticationRequest(
                    username = "authwrong",
                    password = "badPassword"
                )
            )
        }

        assertEquals(ErrorCode.USER__WRONG_PASSWORD, exception.errorCode)
    }

    @Test
    fun `introspects valid token`() {
        val token = authenticationService.generateJWTToken(UUID.randomUUID())

        val response = authenticationService.introspect(IntrospectRequest(token))

        assertTrue(response.isValid)
    }

    @Test
    fun `rejects malformed token during introspection`() {
        assertThrows<Exception> {
            authenticationService.introspect(IntrospectRequest("not-a-jwt"))
        }
    }

    @Test
    fun `extracts user id from token subject`() {
        val userId = UUID.randomUUID()
        val token = authenticationService.generateJWTToken(userId)

        assertEquals(userId.toString(), authenticationService.extractUserId(token))
    }
}
