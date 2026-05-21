package com.osgang.backend.controller

import com.osgang.backend.dto.response.ApiResponse
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
        @RequestParam multipartFile: MultipartFile,
    ): ApiResponse<Set<CardCandidateResponse>> {
        println("Scanning ${multipartFile.originalFilename}")
        return ApiResponse(result = scansService.getCardCandidates(multipartFile))
    }

    @GetMapping("/lookup")
    fun lookupWord(
        @RequestParam("word") word: String,
    ): ApiResponse<List<String>> {
        return ApiResponse(result = dictionaryService.lookup(word))
    }
}