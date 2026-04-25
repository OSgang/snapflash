package com.osgang.backend

import com.osgang.backend.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

private val logger = LoggerFactory.getLogger(SnapFlashBackend::class.java)

@SpringBootApplication
class SnapFlashBackend {
	@Bean
	fun demo(rep: UserRepository) = CommandLineRunner {
		rep.findAll().forEach {
			logger.debug(it.email)
		}
	}
}

@RestController
class MessageController {
	@GetMapping("/")
	fun index() = "Hello"
}

fun main(args: Array<String>) {
	runApplication<SnapFlashBackend>(*args)
}
