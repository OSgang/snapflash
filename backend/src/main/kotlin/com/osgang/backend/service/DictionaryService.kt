package com.osgang.backend.service

import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets

@Service
class DictionaryService (
    //                                 word    definitions
    private var dictionary: MutableMap<String, List<String>> = hashMapOf(),
    @Value("classpath:assets/anhviet.dict")
    private val dictionaryFile: Resource
) {
    @PostConstruct
    fun loadDictionary() {
        try {
            println("\uD83C\uDF46 Loading dictionary...")

            var currentWord = "";
            var currentDefinitions = mutableListOf<String>();

            // For each line
            dictionaryFile.inputStream.bufferedReader(StandardCharsets.UTF_8).useLines { lines ->
                lines
                    .filter { it.isNotBlank() }
                    .filterNot { it.startsWith('*') }  // skip the word class
                    .filterNot { it.startsWith('=') }  // skip the usage example
                    .filterNot { it.startsWith("@00") }  // skip the dictionary metadata
                    .forEach { line ->
                        // If line start with '@' -> flush previous entry into dictionary
                        //                        -> delete currentWord, currentDefinitions
                        //                        -> create new currentWord
                        if (line.startsWith('@')) {
                            if (currentWord.isNotEmpty()) {
                                dictionary[currentWord] = currentDefinitions;
                                currentWord = "";
                                currentDefinitions.clear();
                            } else {
                                currentWord = line.substringAfter('@').substringBefore(' ');
                            }
                        } else {  // if line starts with '-' -> definition
                            currentDefinitions.add(line.substringAfter('-'))
                        }
                }
            }

            println("\uD83D\uDCD6 Dictionary loaded with ${dictionary.size} words")
        } catch (e: Exception) {
            println("Error while loading dictionary: ${e.message}")
            // TODO: Throw a RunTime exception
        }
    }
}