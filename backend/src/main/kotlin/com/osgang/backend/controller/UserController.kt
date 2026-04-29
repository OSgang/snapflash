package com.osgang.backend.controller

import com.osgang.backend.dto.request.UserCreationRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.dto.response.Response
import com.osgang.backend.middleware.LOGGED_IN_USERS
import com.osgang.backend.service.UserService
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID
import kotlin.toString

@RestController
@RequestMapping("/user")
class UserController (
    private val userService: UserService
) {
    @PostMapping("register")
    fun registerUser(@RequestBody request: UserCreationRequest): ResponseEntity<String> {
        return when (val res = userService.userCreationRequest(request)) {
            is Response.Ok -> {
                ResponseEntity
                    .ok("User created.")
            }
            is Response.Err -> ResponseEntity.status(res.error).body(res.customMsg)
        }
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: UserLoginRequest): ResponseEntity<String> {
        return when (val res = userService.userLoginRequest(request)) {
            is Response.Ok -> {

                val cookie = ResponseCookie.from("user_id", requireNotNull(res.value.userId).toString())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .sameSite("Strict") // Protect against CSRF
                    .build()

                ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body("Hello ${res.value.username}")
            }
            is Response.Err -> ResponseEntity.status(res.error).body(res.customMsg)
        }
    }

    fun checkId(uuidStr: String): Boolean {
        try {
            val uuid = UUID.fromString(uuidStr);
            return userService.checkById(uuid)
        } catch (e: Exception) {
            return false;
        }
    }

    @GetMapping("/greet")
    fun greet(): String {
        return "おはようごさいます"
    }
}