package com.osgang.backend.service

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.User
import com.osgang.backend.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService (
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()
) {
    fun userCreationRequest(request: UserCreationRequest): User {

        val user: User = User(
            email = request.email,
            username = request.username,
            passwordHash = requireNotNull(passwordEncoder.encode(request.password))
        )

        return userRepository.save(user)
    }
}