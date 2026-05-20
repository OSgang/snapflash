package com.osgang.backend.dto.response

import java.util.UUID

class CardFlipUpdateResponse(
    val deckId: UUID,
    val cardId: UUID,
    val flipCount: Int
)