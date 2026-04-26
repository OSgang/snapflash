package com.osgang.backend.dto.request

data class UserCreationRequest (
    val email: String,
    val username: String,
    val password: String
) {}