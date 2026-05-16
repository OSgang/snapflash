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
        return "♪♪♪ My pussy tastes like Pepsi Cola\n" +
                "My eyes are wide like cherry pies\n" +
                "I gots a taste for men who are older\n" +
                "It's always been so it's no surprise ♪♪♪"
    }
}