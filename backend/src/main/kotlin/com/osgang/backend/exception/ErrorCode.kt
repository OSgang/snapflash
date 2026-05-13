package com.osgang.backend.dto.response

// sealed class Response<out T, out E> {
//     data class Ok<out T>(val value: T) : Response<T, Nothing>()
//     data class Err<out E>(val error: E, val customMsg: String?) : Response<Nothing, E>()
// }



//USER, DECK, CARD, SCAN
enum class ErrorCode {
    USER__USER_NOT_FOUND(1001, "User not found"),
    USER__EMAIL_EXISTED(1002, "A user with this email already exists"),
    DECK__DECK_NOT_FOUND(2001, "Deck not found"),
    CARD__CARD_NOT_FOUND(3001, "Card not found");


    private val code : int;
    private val message : string;

}




