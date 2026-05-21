package com.osgang.backend.service

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class ScanServiceTest @Autowired constructor(
    private val scanService: ScanService
) {
    @Test
    fun `card candidate curation filters words shorter than minimum length`() {
        val candidates = scanService.cardCandidatesCuration(
            extractedCardCandidates = listOf("a", "an", "apple", "book"),
            minWordLength = 3
        )

        assertFalse("a" in candidates)
        assertFalse("an" in candidates)
        assertTrue("apple" in candidates)
        assertTrue("book" in candidates)
    }

    @Test
    fun `card candidate curation respects requested candidate count`() {
        val candidates = scanService.cardCandidatesCuration(
            extractedCardCandidates = listOf("alpha", "bravo", "charlie", "delta"),
            numOfCandidates = 2
        )

        assertEquals(2, candidates.size)
    }

    @Test
    fun `card candidate curation returns unique words`() {
        val candidates = scanService.cardCandidatesCuration(
            extractedCardCandidates = listOf("alpha", "alpha", "bravo", "bravo", "charlie")
        )

        assertEquals(candidates.toSet().size, candidates.size)
    }
}
