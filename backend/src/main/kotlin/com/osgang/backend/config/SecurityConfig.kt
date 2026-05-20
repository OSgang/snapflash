package com.osgang.backend.config

import com.nimbusds.jose.JWSAlgorithm
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import javax.crypto.spec.SecretKeySpec
import org.springframework.security.oauth2.jose.jws.MacAlgorithm

@Configuration
@EnableWebSecurity
class SecurityConfig (
    @Value("\${JWT_SIGNER_KEY}") private val SIGNER_KEY: String
) {
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
            // Tell Spring to act as an OAuth2 Resource Server
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.decoder(jwtDecoder())
                }
            }

        return http.build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val secretKey = SecretKeySpec(SIGNER_KEY.toByteArray(), "HmacSHA256")

        // Explicitly tell Spring to expect the HS256 algorithm
        return NimbusJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}