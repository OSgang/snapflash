package com.osgang.backend.dto.request

import java.util.*

class CardCreationRequest(
    val deckId: UUID,
    val word: String,
    val translation: String,
    val definition: String
)