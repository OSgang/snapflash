package com.osgang.backend.service

import com.osgang.backend.dto.response.CardCandidateResponse
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import net.sourceforge.tess4j.Tesseract
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO

@Service
class ScanService (
    @Value("\${tesseract.datapath}") private val tesseractDataPath: String,
    val dictionaryService: DictionaryService
) {
    fun getCardCandidates(multipartFile: MultipartFile): Set<CardCandidateResponse> {
        val extractedCardCandidates: List<String> = this.extractOCR(multipartFile)
        val listOfCandidates: List<String> = this.cardCandidatesCuration(extractedCardCandidates)

        val candidates = listOfCandidates.mapNotNull {
            val candidateDefinition = dictionaryService.lookup(it)
            if (candidateDefinition.isNotEmpty()) {
                CardCandidateResponse(it.lowercase(), candidateDefinition)
            } else {
                null
            }
        }.toSet()

        println("🫩 Finished scan!")
        println("Candidates: $candidates")
        return candidates
    }

    fun extractOCR(multipartFile: MultipartFile): List<String> {
        val tempFile = File.createTempFile("ocr_temp", ".jpg") // ✅ .jpg thay vì .png

        val tesseract = Tesseract().apply {
            setDatapath(tesseractDataPath)
            setLanguage("eng")
        }

        return try {
            multipartFile.transferTo(tempFile)

            // ✅ Load thành BufferedImage trước, bỏ qua format detection của Tess4j
            val original: BufferedImage = ImageIO.read(tempFile)
                ?: throw AppException(ErrorCode.SCAN__FAILED)

            // ✅ Convert sang RGB để Tess4j OCR chuẩn xác hơn (bỏ alpha channel)
            val rgbImage = BufferedImage(original.width, original.height, BufferedImage.TYPE_INT_RGB)
            val g2d = rgbImage.createGraphics()
            g2d.drawImage(original, 0, 0, null)
            g2d.dispose()

            println("\uD83E\uDEC2 Extracting text from image...")
            val extractedText = tesseract.doOCR(rgbImage)
                .trim()
                .split(Regex("[^a-zA-Z]+"))

            extractedText
        } catch (e: Exception) {
            println("OCR Processing failed: ${e.message}}")
            throw AppException(ErrorCode.SCAN__FAILED)
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
        val wordAppearHistogram = hashMapOf<String, Int>()

        extractedCardCandidates.forEach {
            if (it.length < minWordLength) { return@forEach }
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
