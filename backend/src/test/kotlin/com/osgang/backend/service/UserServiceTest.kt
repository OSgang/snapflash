package com.osgang.backend.service

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.repository.UserRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceTest @Autowired constructor(
    private val userService: UserService,
    private val userRepository: UserRepository
) {
    @Test
    fun `registers a new user with hashed password`() {
        val createdUser = userService.userCreationRequest(
            UserCreationRequest(
                email = "new.user@example.com",
                username = "newuser",
                password = "securePassword123"
            )
        )

        assertNotNull(createdUser.userId)
        assertEquals("new.user@example.com", createdUser.email)
        assertEquals("newuser", createdUser.username)
        assertFalse(createdUser.passwordHash == "securePassword123")
        assertTrue(BCryptPasswordEncoder().matches("securePassword123", createdUser.passwordHash))
    }

    @Test
    fun `rejects duplicate email registration`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "duplicate@example.com",
                username = "firstuser",
                password = "securePassword123"
            )
        )

        val exception = assertThrows<AppException> {
            userService.userCreationRequest(
                UserCreationRequest(
                    email = "duplicate@example.com",
                    username = "seconduser",
                    password = "securePassword456"
                )
            )
        }

        assertEquals(ErrorCode.USER__EMAIL_EXISTED, exception.errorCode)
    }

    @Test
    fun `logs in existing user with correct password`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "login@example.com",
                username = "loginuser",
                password = "securePassword123"
            )
        )

        val user = userService.userLoginRequest(
            UserLoginRequest(
                username = "loginuser",
                password = "securePassword123"
            )
        )

        assertEquals("login@example.com", user.email)
        assertEquals("loginuser", user.username)
    }

    @Test
    fun `rejects login for missing user`() {
        val exception = assertThrows<AppException> {
            userService.userLoginRequest(
                UserLoginRequest(
                    username = "missinguser",
                    password = "securePassword123"
                )
            )
        }

        assertEquals(ErrorCode.USER__USER_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `rejects login with wrong password`() {
        userService.userCreationRequest(
            UserCreationRequest(
                email = "wrong.password@example.com",
                username = "wrongpassword",
                password = "securePassword123"
            )
        )

        val exception = assertThrows<AppException> {
            userService.userLoginRequest(
                UserLoginRequest(
                    username = "wrongpassword",
                    password = "notThePassword"
                )
            )
        }

        assertEquals(ErrorCode.USER__WRONG_PASSWORD, exception.errorCode)
    }

    @Test
    fun `checks user existence by id`() {
        val createdUser = userService.userCreationRequest(
            UserCreationRequest(
                email = "exists@example.com",
                username = "existsuser",
                password = "securePassword123"
            )
        )

        assertTrue(userService.checkById(createdUser.userId!!))
        assertTrue(userRepository.existsByUsername("existsuser"))
    }
}
