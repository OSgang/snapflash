package com.osgang.backend

import io.sentry.Sentry
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BackendApplication

fun main(args: Array<String>) {
    val sentryDsn = System.getenv("SENTRY_DSN")

    if (!sentryDsn.isNullOrBlank()) {
        Sentry.init { options ->
            options.dsn = sentryDsn
            options.environment = System.getenv("SENTRY_ENVIRONMENT") ?: "production"
            options.release = System.getenv("SENTRY_RELEASE") ?: "snapflash-backend@1.0.0"
            options.tracesSampleRate =
                System.getenv("SENTRY_TRACES_SAMPLE_RATE")?.toDoubleOrNull() ?: 1.0
            options.isSendDefaultPii = false
        }
    }

    runApplication<BackendApplication>(*args)
}