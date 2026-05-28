package com.osgang.backend.dto

import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.CardFlipUpdateRequest
import com.osgang.backend.dto.request.ChangePasswordRequest
import com.osgang.backend.dto.request.IntrospectRequest
import com.osgang.backend.dto.request.UserLoginRequest
import com.osgang.backend.dto.response.ApiResponse
import com.osgang.backend.dto.response.AuthenticationResponse
import com.osgang.backend.dto.response.CardCandidateResponse
import com.osgang.backend.dto.response.CardFlipUpdateResponse
import com.osgang.backend.dto.response.IntrospectResponse
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class DtoContractTest {
    @Test
    fun `api response defaults to success wrapper`() {
        val response = ApiResponse(result = "ok")

        assertEquals(200, response.code)
        assertEquals("Success", response.message)
        assertEquals("ok", response.result)
    }

    @Test
    fun `authentication and introspection response contracts expose values`() {
        val auth = AuthenticationResponse("token", true, "alice")
        val introspect = IntrospectResponse(isValid = false)

        assertEquals("token", auth.jwtToken)
        assertTrue(auth.isAuthenticated)
        assertEquals("alice", auth.username)
        assertFalse(introspect.isValid)
    }

    @Test
    fun `request DTOs preserve submitted fields`() {
        val cardId = UUID.randomUUID()

        assertEquals("alice", AuthenticationRequest("alice", "secret").username)
        assertEquals("jwt", IntrospectRequest("jwt").jwtToken)
        assertEquals("alice", UserLoginRequest("alice", "secret").username)
        assertEquals("new", ChangePasswordRequest("old", "new").newPassword)
        assertEquals(3, CardFlipUpdateRequest(cardId, 3).flipCount)
    }

    @Test
    fun `card candidate and flip update responses preserve values`() {
        val deckId = UUID.randomUUID()
        val cardId = UUID.randomUUID()
        val candidate = CardCandidateResponse("apple", listOf("táo"))
        val flip = CardFlipUpdateResponse(deckId, cardId, 5)

        assertEquals("apple", candidate.word)
        assertEquals(listOf("táo"), candidate.translation)
        assertEquals(deckId, flip.deckId)
        assertEquals(cardId, flip.cardId)
        assertEquals(5, flip.flipCount)
    }
}
