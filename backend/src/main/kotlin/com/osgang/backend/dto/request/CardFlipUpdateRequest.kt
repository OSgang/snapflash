package com.osgang.backend.dto.request

import java.util.UUID

class CardFlipUpdateRequest(
    val cardId: UUID,
    val flipCount: Int
)