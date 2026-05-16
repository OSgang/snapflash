package com.osgang.backend.controller

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.entity.User
import com.osgang.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/user")
class UserController(
    private val userService: UserService
) {
    @PostMapping("/register")
    fun registerUser(@RequestBody request: UserCreationRequest): ApiResponse<User> {
        return ApiResponse(result = userService.userCreationRequest(request))
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: UserLoginRequest): ApiResponse<User> {
        return ApiResponse(result = userService.userLoginRequest(request))
    }

    @GetMapping("/greet")
    fun greet(): String {
        return "♪♪♪ So, get away\n" +
                "Another way to feel what you didn't want yourself to know\n" +
                "And let yourself go\n" +
                "You know you didn't lose your self-control\n" +
                "Let's start at the rainbow\n" +
                "Turn away\n" +
                "Another way to be where you didn't want yourself to go\n" +
                "And let yourself go\n" +
                "Is that a compromise? ♪♪♪"
    }
}