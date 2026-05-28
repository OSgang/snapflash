package com.osgang.backend.service

import com.osgang.backend.dto.response.CardCandidateResponse
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import net.sourceforge.tess4j.Tesseract
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.awt.RenderingHints
import java.awt.image.BufferedImage
import java.io.File
import java.util.concurrent.Semaphore
import javax.imageio.ImageIO
import kotlin.math.roundToInt

@Service
class ScanService (
    @Value("\${tesseract.datapath}") private val tesseractDataPath: String,
    val dictionaryService: DictionaryService
) {
    private val ocrSemaphore = Semaphore(1, true)

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
        println("Found ${candidates.size} candidates")
        return candidates
    }

    fun extractOCR(multipartFile: MultipartFile): List<String> {
        val tempFile = File.createTempFile("ocr_temp", ".jpg")  // .jpg instead of .png

        val tesseract = Tesseract().apply {
            setDatapath(tesseractDataPath)
            setLanguage("eng")
        }

        return try {
            multipartFile.transferTo(tempFile)

            ocrSemaphore.acquire()
            try {
                val image = readScaledGrayscaleImage(tempFile)

                println("\uD83E\uDEC2 Extracting text from ${image.width}x${image.height} image...")
                tesseract.doOCR(image)
                    .trim()
                    .split(Regex("[^a-zA-Z]+"))
            } finally {
                ocrSemaphore.release()
            }
        } catch (e: Exception) {
            println("OCR Processing failed: ${e.message}}")
            throw AppException(ErrorCode.SCAN__FAILED)
        } finally {
            if (tempFile.exists()) {
                val isDeleted = tempFile.delete()
                if (!isDeleted) {
                    println("Failed to delete temporary OCR file: ${tempFile.absolutePath}")
                }
            }
        }
    }

    private fun readScaledGrayscaleImage(file: File): BufferedImage {
        val imageInputStream = ImageIO.createImageInputStream(file)
            ?: throw AppException(ErrorCode.SCAN__FAILED)

        imageInputStream.use { stream ->
            val readers = ImageIO.getImageReaders(stream)
            if (!readers.hasNext()) {
                throw AppException(ErrorCode.SCAN__FAILED)
            }

            val reader = readers.next()
            return try {
                reader.input = stream
                val originalWidth = reader.getWidth(0)
                val originalHeight = reader.getHeight(0)
                val readParam = reader.defaultReadParam
                val subsampling = calculateSubsampling(originalWidth, originalHeight)

                if (subsampling > 1) {
                    readParam.setSourceSubsampling(subsampling, subsampling, 0, 0)
                }

                val decodedImage = reader.read(0, readParam)
                    ?: throw AppException(ErrorCode.SCAN__FAILED)

                resizeAndConvertToGrayscale(decodedImage)
            } finally {
                reader.dispose()
            }
        }
    }

    private fun calculateSubsampling(width: Int, height: Int): Int {
        val longestSide = maxOf(width, height)
        return (longestSide.toDouble() / MAX_OCR_IMAGE_DIMENSION).roundToInt().coerceAtLeast(1)
    }

    private fun resizeAndConvertToGrayscale(image: BufferedImage): BufferedImage {
        val longestSide = maxOf(image.width, image.height)
        val scale = if (longestSide > MAX_OCR_IMAGE_DIMENSION) {
            MAX_OCR_IMAGE_DIMENSION.toDouble() / longestSide
        } else {
            1.0
        }

        val targetWidth = (image.width * scale).roundToInt().coerceAtLeast(1)
        val targetHeight = (image.height * scale).roundToInt().coerceAtLeast(1)
        val grayscaleImage = BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_BYTE_GRAY)
        val g2d = grayscaleImage.createGraphics()

        try {
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR)
            g2d.drawImage(image, 0, 0, targetWidth, targetHeight, null)
        } finally {
            g2d.dispose()
        }

        return grayscaleImage
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

    companion object {
        private const val MAX_OCR_IMAGE_DIMENSION = 1800
    }
}
