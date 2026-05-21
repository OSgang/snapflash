package com.osgang.backend.controller

import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.IntrospectRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.dto.request.UserLogoutRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.dto.response.AuthenticationResponse
import com.osgang.backend.dto.response.IntrospectResponse
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/user")
class UserController(
    private val userService: UserService,
    private val authenticationService: AuthenticationService
) {

    @PostMapping("/logout")
    fun logoutUser(@RequestBody request: UserLogoutRequest): ApiResponse<String>{
        authenticationService.logout(request)
        return ApiResponse(result = "Logout successful")
    }

    @PostMapping("/register")
    fun registerUser(@RequestBody request: UserCreationRequest): ApiResponse<User> {
        return ApiResponse(result = userService.userCreationRequest(request))
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: AuthenticationRequest): ApiResponse<AuthenticationResponse> {
//        println("API LOGIN")

        return ApiResponse(
            result = authenticationService.authenticate(request)
        )
    }

    @PostMapping("/introspect")
    fun authenticate(@RequestBody request: IntrospectRequest): ApiResponse<IntrospectResponse> {
        return ApiResponse(
            result = authenticationService.introspect(request)
        )
    }

    @GetMapping("/greet")
    fun greet(): String {
//        println("API GREET")
        return "♪♪♪ My pussy tastes like Pepsi Cola\n" +
                "My eyes are wide like cherry pies\n" +
                "I gots a taste for men who are older\n" +
                "It's always been so it's no surprise ♪♪♪"
    }
}