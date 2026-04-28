package com.osgang.backend.middleware

import com.osgang.backend.controller.UserController
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

// Im sorry god i dont know how to do real authentication yet
public var LOGGED_IN_USERS: MutableSet<UUID> = mutableSetOf()

@Component
class LoggingMiddleware : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startTime = System.currentTimeMillis()

        // Code before the request reaches the controller
        println("Request received: ${request.method} ${request.requestURI}")

        if (request.requestURI !in listOf("/user/register", "/user/login")) {
            val id = request.cookies.find { it.name == "user_id" };

            val hasValidUUID =
                try {
                    LOGGED_IN_USERS.contains(UUID.fromString(id!!.value))
                } catch (e: Exception) {
                    false
                }

            if (!hasValidUUID) {
                response.status = HttpServletResponse.SC_FORBIDDEN;
                response.writer.write("Access Token invalid or missing.");
                return;
            }
        }

        filterChain.doFilter(request, response) // Pass to next filter/controller

        // Code after the controller finishes
        val duration = System.currentTimeMillis() - startTime
        println("Request processed in ${duration}ms")
    }
}
