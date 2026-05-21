package com.osgang.backend.dto.response

import com.osgang.backend.entity.Flashcard

data class LearningJourneyResponse(
    val mastered: List<Flashcard>,
    val learning: List<Flashcard>
)
