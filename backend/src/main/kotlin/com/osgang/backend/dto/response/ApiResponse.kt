package com.osgang.backend.dto.response

data class ApiResponse<T>(
    val code: Int = 1000,
    val message: String = "Success",
    val result: T
)

