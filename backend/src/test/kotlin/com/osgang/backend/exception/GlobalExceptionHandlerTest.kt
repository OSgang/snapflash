package com.osgang.backend.exception

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class GlobalExceptionHandlerTest {
    private val handler = GlobalExceptionHandler()

    @Test
    fun `handle app exception returns configured status and message`() {
        val response = handler.handleAppException(AppException(ErrorCode.CARD__INVALID_LIMIT))

        assertEquals(400, response.statusCode.value())
        assertEquals("Limit must be at least 1", response.body)
    }

    @Test
    fun `response ok stores successful value`() {
        val response: Response<String, ErrorCode> = Response.Ok("created")

        val ok = assertIs<Response.Ok<String>>(response)
        assertEquals("created", ok.value)
    }

    @Test
    fun `response err stores error and custom message`() {
        val response: Response<String, ErrorCode> = Response.Err(ErrorCode.JWT__INVALID_TOKEN, "bad signature")

        val err = assertIs<Response.Err<ErrorCode>>(response)
        assertEquals(ErrorCode.JWT__INVALID_TOKEN, err.error)
        assertEquals("bad signature", err.customMsg)
    }
}
