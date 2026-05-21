package com.osgang.backend.service

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class DictionaryServiceTest @Autowired constructor(
    private val dictionaryService: DictionaryService
) {
    @Test
    fun `looks up dictionary word case insensitively`() {
        val lowercaseDefinitions = dictionaryService.lookup("a")
        val uppercaseDefinitions = dictionaryService.lookup("A")

        assertTrue(lowercaseDefinitions.isNotEmpty())
        assertEquals(lowercaseDefinitions, uppercaseDefinitions)
    }

    @Test
    fun `returns empty list for missing word`() {
        assertEquals(emptyList(), dictionaryService.lookup("word-that-does-not-exist"))
    }
}
