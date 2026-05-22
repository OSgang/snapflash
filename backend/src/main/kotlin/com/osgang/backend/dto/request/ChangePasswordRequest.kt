package com.osgang.backend.dto.request

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)
