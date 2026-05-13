package com.osgang.backend.controller

import com.osgang.backend.dto.response.CardCandidateResponse
import com.osgang.backend.service.DictionaryService
import com.osgang.backend.service.ScanService
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
class ScanController (
    private val scansService: ScanService,
    private val dictionaryService: DictionaryService
) {
    @PostMapping("/scan")
    fun scanAndCreate(
        @CookieValue("user_id") userId: UUID,
        @RequestParam multipartFile: MultipartFile,
    ): Set<CardCandidateResponse> {
        println("Scanning ${multipartFile.originalFilename}")
        return scansService.extractOCR(multipartFile)
    }

    @GetMapping("/lookup")
    fun lookupWord(
        @RequestParam("word") word: String,
    ): List<String> {
        return dictionaryService.lookup(word)
    }
}