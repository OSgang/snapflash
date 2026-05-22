package com.osgang.backend.service


import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.entity.User
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.exception.AppException
import com.osgang.backend.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder(),
) {
    // fun userCreationRequest(request: UserCreationRequest): Response<User, HttpStatus> {
    fun userCreationRequest(request: UserCreationRequest): User {
        val user = User(
            email = request.email,
            username = request.username,
            passwordHash = requireNotNull(passwordEncoder.encode(request.password))
        )

        if (userRepository.existsByEmail(request.email)) {
            throw AppException(ErrorCode.USER__EMAIL_EXISTED)
        }

        return userRepository.save(user)
    }

    fun getUserById(id: UUID): User {
        return userRepository.getReferenceById(id)
    }

    fun saveUser(user: User): User {
        return userRepository.save(user)
    }

    fun checkById(id: UUID): Boolean {
        return userRepository.existsByUserId(id)
    }

    // fun userLoginRequest(request: UserLoginRequest): Response<User, HttpStatus> {
    fun userLoginRequest(request: UserLoginRequest): User {
        val user = userRepository.findByUsername(request.username)
        // user ?: return Response.Err(HttpStatus.NOT_FOUND, "Can't find user.")
        user ?: throw AppException(ErrorCode.USER__USER_NOT_FOUND)

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            // return Response.Err(HttpStatus.UNAUTHORIZED, "Wrong password.")
            throw AppException(ErrorCode.USER__WRONG_PASSWORD)
        }

//        LOGGED_IN_USERS.add(requireNotNull(user.userId))

        return user
    }
}