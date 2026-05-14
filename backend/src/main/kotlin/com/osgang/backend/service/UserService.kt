package com.osgang.backend.service


import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.dto.response.Response
import com.osgang.backend.entity.User
import com.osgang.backend.middleware.LOGGED_IN_USERS
import com.osgang.backend.repository.UserRepository
import org.springframework.http.HttpStatus
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
    fun userCreationRequest(request: UserCreationRequest): ApiResponse<User> {
        val user: User = User(
            email = request.email,
            username = request.username,
            passwordHash = requireNotNull(passwordEncoder.encode(request.password))
        )

        if (userRepository.existsByEmail(request.email)) {
            // return Response.Err(HttpStatus.CONFLICT, "A user with this email already exists.")
            throw AppException(ErrorCode.USER__EMAIL_EXISTED)
        }

        // if (userRepository.existsByUsername(request.username)) {
        //     return Response.Err(HttpStatus.CONFLICT, "A user with this username already exists.")
        // }
        // val ret = ApiResponse(result=user) 

        return ApiResponse(result=user);

        // return try {
        //     // Response.Ok(userRepository.save(user))
        //     ApiResponse.result
        // } catch (e: AppException) {
        //     // Response.Err(HttpStatus.INTERNAL_SERVER_ERROR, e.toString())
        //     ApiResponse.(ErrorCode.USER__USER_NOT_FOUND)
        // }
    }

    fun getUserById(id: UUID): User? {
        return try {
            userRepository.getReferenceById(id)
        } catch (e: Exception) {
           throw ApiResponse.(ErrorCode.USER__USER_NOT_FOUND)
        }
    }

    fun saveUser(user: User): User {
        return userRepository.save(user)
    }

    fun checkById(id: UUID): Boolean {
        return userRepository.existsByUserId(id)
    }

    // fun userLoginRequest(request: UserLoginRequest): Response<User, HttpStatus> {
    fun userLoginRequest(request: UserLoginRequest): ApiResponse<User> {
        try {
            val user = userRepository.findByUsername(request.username)
            // user ?: return Response.Err(HttpStatus.NOT_FOUND, "Can't find user.")
            user ?: return ApiResponse.(ErrorCode.USER__USER_NOT_FOUND)

            if (!passwordEncoder.matches(request.password, user.passwordHash)) {
                // return Response.Err(HttpStatus.UNAUTHORIZED, "Wrong password.")
                return ApiResponse.(ErrorCode.USER__WRONG_PASSWORD)
            }

            LOGGED_IN_USERS.add(requireNotNull(user.userId))

            return Response.Ok(user)
        } catch (e: Exception) {
            // return Response.Err(HttpStatus.INTERNAL_SERVER_ERROR, e.toString())
            throw ApiResponse.(ErrorCode.USER__WRONG_PASSWORD)
        }
    }
}