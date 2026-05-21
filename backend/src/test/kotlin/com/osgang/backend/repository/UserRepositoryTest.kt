package com.osgang.backend.repository

import com.osgang.backend.entity.User
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserRepositoryTest @Autowired constructor(
    private val userRepository: UserRepository
) {
    @Test
    fun `saves and finds user by email username and user id`() {
        val user = userRepository.saveAndFlush(
            User(
                email = "repository-user@example.com",
                username = "repositoryuser",
                passwordHash = "hashed-password"
            )
        )

        assertNotNull(user.userId)
        assertEquals(user.userId, userRepository.findByEmail("repository-user@example.com")?.userId)
        assertEquals(user.userId, userRepository.findByUsername("repositoryuser")?.userId)
        assertEquals(user.userId, userRepository.findByUserId(user.userId!!)?.userId)
    }

    @Test
    fun `checks existence by email username and user id`() {
        val user = userRepository.saveAndFlush(
            User(
                email = "repository-exists@example.com",
                username = "repositoryexists",
                passwordHash = "hashed-password"
            )
        )

        assertTrue(userRepository.existsByEmail("repository-exists@example.com"))
        assertTrue(userRepository.existsByUsername("repositoryexists"))
        assertTrue(userRepository.existsByUserId(user.userId!!))
    }

    @Test
    fun `returns null for missing lookup values`() {
        assertNull(userRepository.findByEmail("missing@example.com"))
        assertNull(userRepository.findByUsername("missinguser"))
    }

    @Test
    fun `enforces unique email constraint`() {
        userRepository.saveAndFlush(
            User(
                email = "repository-duplicate@example.com",
                username = "repositoryduplicateone",
                passwordHash = "hashed-password"
            )
        )

        assertThrows<DataIntegrityViolationException> {
            userRepository.saveAndFlush(
                User(
                    email = "repository-duplicate@example.com",
                    username = "repositoryduplicatetwo",
                    passwordHash = "hashed-password"
                )
            )
        }
    }
}
