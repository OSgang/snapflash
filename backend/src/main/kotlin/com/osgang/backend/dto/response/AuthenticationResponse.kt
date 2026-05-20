package com.osgang.backend.dto.response

data class AuthenticationResponse (
    val jwtToken: String,
    val isAuthenticated: Boolean,
    val username: String
)