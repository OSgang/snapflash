package com.osgang.backend.dto.response

sealed class Response<out T, out E> {
    data class Ok<out T>(val value: T): Response<T, Nothing>()
    data class Err<out E>(val error: E, val customMsg: String?): Response<Nothing, E>()
}
