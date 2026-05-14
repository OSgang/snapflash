package com.osgang.backend.exception

sealed class Response<out T, out E> {
    data class Ok<out T>(val value: T) : Response<T, Nothing>()
    data class Err<out E>(val error: E, val customMsg: String?) : Response<Nothing, E>()
}



//USER, DECK, CARD, SCAN
enum class ErrorCode(
    val code : Int,
    val message : String
) {
    USER__USER_NOT_FOUND(404, "User not found"),
    USER__EMAIL_EXISTED(409, "A user with this email already exists"),
    USER__WRONG_PASSWORD(400, "Wrong password"),
    DECK__DECK_NOT_FOUND(404, "Deck not found"),
    CARD__CARD_NOT_FOUND(404, "Card not found");
}




