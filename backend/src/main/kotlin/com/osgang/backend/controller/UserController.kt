package com.osgang.backend.controller

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.entity.User
import com.osgang.backend.service.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController (
    private val userService: UserService
) {
    @PostMapping("/user/register")
    fun registerUser(@RequestBody request: UserCreationRequest): User {
        return userService.userCreationRequest(request)
    }

    @GetMapping("/greet")
    fun greet(): String {
        return "おはようごさいます"
    }
}