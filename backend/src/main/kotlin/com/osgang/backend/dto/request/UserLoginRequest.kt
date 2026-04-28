package com.osgang.backend.dto.request

data class UserLoginRequest (
    val username: String,
    val password: String
) {}