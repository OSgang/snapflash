package com.osgang.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Disable CSRF. This is required for REST APIs, otherwise
            // Postman POST requests will be automatically blocked.
            .csrf { it.disable() }

            // Configure endpoint access rules
            .authorizeHttpRequests { authorize ->
                authorize
                    // Allow anyone (no token required) to hit these specific POST endpoints
                    .requestMatchers(
                        HttpMethod.POST,
                        "/user/register",
                        "/user/login",
                        "/user/introspect"
                    ).permitAll()

                    // This will allow any error to be shown when it is thrown
                    .requestMatchers("/error").permitAll()

                    .requestMatchers(HttpMethod.GET, "/user/greet").permitAll()

                    // Require a valid token for EVERY other endpoint in your app
                    .anyRequest().authenticated()
            }

        return http.build()
    }
}