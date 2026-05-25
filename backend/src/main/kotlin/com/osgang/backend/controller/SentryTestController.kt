package com.osgang.backend.controller

import io.sentry.Sentry
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/test")
class SentryTestController {

    @GetMapping("/sentry-message")
    fun sentryMessage(): String {
        Sentry.captureMessage("Test Sentry message from SnapFlash backend")
        return "Sentry test message sent"
    }

    @GetMapping("/sentry-error")
    fun sentryError(): String {
        try {
            throw RuntimeException("Test Sentry error from SnapFlash backend")
        } catch (ex: Exception) {
            Sentry.captureException(ex)
            throw ex
        }
    }
}