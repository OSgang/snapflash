package com.osgang.backend.service

import com.osgang.backend.dto.response.CardCandidateResponse
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import net.sourceforge.tess4j.Tesseract
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile

import java.io.File

@Service
class ScanService (
    @Value("\${tesseract.datapath}") private val tesseractDataPath: String,
    val dictionaryService: DictionaryService
) {
    fun extractOCR(multipartFile: MultipartFile): Set<CardCandidateResponse> {
        val tempFile = File.createTempFile("ocr_temp", ".png")

        // Services like ScanService are Singletons by default. That means Spring only creates one instance of ScanService for the entire lifetime of your application. Create the Tesseract inside the function so every upload gets its own isolated engine
        val tesseract = Tesseract().apply {
            setDatapath(tesseractDataPath)
            setLanguage("eng")
        }

        return try {
            multipartFile.transferTo(tempFile)

            println("\uD83E\uDEC2 Extracting text from image...")
            val extractedText = tesseract.doOCR(tempFile)
                .trim()
                .split(Regex("[^a-zA-Z]+"))

            val listOfCandidates = mutableSetOf<CardCandidateResponse>()

            extractedText.forEach {
                val candidateDefinition = dictionaryService.lookup(it)

                if (candidateDefinition.isNotEmpty()) {
                    listOfCandidates.add(CardCandidateResponse(it.lowercase(), candidateDefinition))
                }

            }

            listOfCandidates
        } catch (e: Exception) {
            println("OCR Processing failed: ${e.message}}")
            throw AppException(ErrorCode.SCAN__FAILED)
        } finally {
            if (tempFile.exists()) {
                tempFile.delete()
            }
        }
    }
}