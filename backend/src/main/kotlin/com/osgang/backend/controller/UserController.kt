package com.osgang.backend.controller

import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.ChangePasswordRequest
import com.osgang.backend.dto.request.IntrospectRequest
import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.dto.response.AuthenticationResponse
import com.osgang.backend.dto.response.IntrospectResponse
import com.osgang.backend.entity.User
import com.osgang.backend.service.AuthenticationService
import com.osgang.backend.service.UserService
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/user")
class UserController(
    private val userService: UserService,
    private val authenticationService: AuthenticationService
) {

    @PostMapping("/logout")
    fun logoutUser(
        @RequestHeader("Authorization") authorizationHeader: String
    ): ApiResponse<String>{
        val jwtToken = authorizationHeader.replace("Bearer ", "")

        authenticationService.logout(jwtToken)
        return ApiResponse(result = "Logout successful")
    }

    @PatchMapping("/change-password")
    fun changePassword(
        @RequestHeader("Authorization") authorizationHeader: String,
        @RequestBody request: ChangePasswordRequest
    ): ApiResponse<String> {
        val jwtToken = authorizationHeader.replace("Bearer ", "")
        val userId = UUID.fromString(authenticationService.extractUserId(jwtToken))

        return ApiResponse(result = userService.changePassword(userId, request))
    }

    @PostMapping("/register")
    fun registerUser(@RequestBody request: UserCreationRequest): ApiResponse<User> {
        return ApiResponse(result = userService.userCreationRequest(request))
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: AuthenticationRequest): ApiResponse<AuthenticationResponse> {
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
        return "♪♪♪ She said she didn't have no man\n" +
                "Raised the kids the very best she can (She was lovin' me)\n" +
                "She told me she was all alone\n" +
                "Said at home, she didn't have no phone (She was wantin' me)\n" +
                "She said just to give her a page\n" +
                "Fifty-nine was the code she gave (She was lovin' me)\n" +
                "She'd lied to you, lied to me\n" +
                "'Cause she was lovin' me, lovin' me, yeah ♪♪♪"
    }
}
