package com.osgang.backend.service

import com.osgang.backend.dto.response.CardCandidateResponse
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
    fun getCardCandidates(multipartFile: MultipartFile): Set<CardCandidateResponse> {
        val extractedCardCandidates: List<String> = this.extractOCR(multipartFile)

        val listOfCandidates: List<String> = this.cardCandidatesCuration(extractedCardCandidates)

        return listOfCandidates.mapNotNull {
            val candidateDefinition = dictionaryService.lookup(it)
            if (candidateDefinition.isNotEmpty()) {
                 CardCandidateResponse(it.lowercase(), candidateDefinition)
            } else {
                null
            }
        }.toSet()

    }

    fun extractOCR(multipartFile: MultipartFile): List<String> {
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

            extractedText
        } catch (e: Exception) {
            println("OCR Processing failed: ${e.message}}")
            throw RuntimeException("Failed to extract text from image", e)
        } finally {
            if (tempFile.exists()) {
                tempFile.delete()
            }
        }
    }

    fun cardCandidatesCuration(
        extractedCardCandidates: List<String>,
        numOfCandidates: Int = 15,
        minWordLength: Int = 3
    ): List<String> {
        val wordAppearHistogram = hashMapOf<String, Int>()  // a var to keep track of the number of time each word appear

        extractedCardCandidates.forEach {
            if (it.length < minWordLength) { return@forEach }  // continue if the word length is < minWordLength
            if (it !in wordAppearHistogram) {
                wordAppearHistogram[it] = 1
            } else {
                wordAppearHistogram[it]?.plus(1)
            }
        }

        val sortedCardCandidates: List<Pair<String, Int>> = wordAppearHistogram.toList().sortedByDescending { it.second }

        return sortedCardCandidates.map { it.first }.take(numOfCandidates)
    }
}