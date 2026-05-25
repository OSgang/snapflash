package com.osgang.backend.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/test")
class SentryTestController {

    @GetMapping("/sentry-error")
    fun triggerSentryError(): String {
        throw RuntimeException("Test Sentry error from SnapFlash backend")
    }
}