package com.osgang.backend.service

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.JWSObject
import com.nimbusds.jose.Payload
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jose.crypto.MACVerifier
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import com.osgang.backend.dto.request.AuthenticationRequest
import com.osgang.backend.dto.request.IntrospectRequest
import com.osgang.backend.dto.response.AuthenticationResponse
import com.osgang.backend.dto.response.IntrospectResponse
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.repository.UserRepository

import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date

@Service
class AuthenticationService (
    val userRepository: UserRepository,
    @Value("\${JWT_SIGNER_KEY}") val SIGNER_KEY: String
) {
    fun introspect(request: IntrospectRequest): IntrospectResponse {
        val jwtToken = request.jwtToken

        val verifier = MACVerifier(SIGNER_KEY.toByteArray())

        val signedJWT = SignedJWT.parse(jwtToken)

        val expirationTime = signedJWT.jwtClaimsSet.expirationTime

        val isVerified = signedJWT.verify(verifier)

        return IntrospectResponse(
            isValid = isVerified && expirationTime.after(Date())
        )
    }

    fun authenticate(request: AuthenticationRequest): AuthenticationResponse {
        val user = userRepository.findByUsername(request.username)
        user ?: throw AppException(ErrorCode.USER__USER_NOT_FOUND)

        val passwordEncoder = BCryptPasswordEncoder()

        val isMatches = passwordEncoder.matches(request.password, user.passwordHash)
        if (!isMatches) {
            throw AppException(ErrorCode.USER__WRONG_PASSWORD)
        }

        val jwtToken = generateJWTToken(request.username)

        return AuthenticationResponse(
            jwtToken,
            true,
            user.username,
        )
    }

    fun generateJWTToken(username: String): String {
        println("THE KEY IS: $SIGNER_KEY")
        println("THE LENGTH IS: ${SIGNER_KEY.length}")

        val jwsHeader = JWSHeader(JWSAlgorithm.HS512)

        val jwtClaimset = JWTClaimsSet.Builder()
            .subject(username)
            .issuer("osgang.com")
            .issueTime(Date())
            .expirationTime(Date(
                Instant.now().plus(4, ChronoUnit.HOURS).toEpochMilli()
            ))
            .build()

        val payload = Payload(jwtClaimset.toJSONObject())

        val jwsObject = JWSObject(jwsHeader, payload)

        try {
            jwsObject.sign(MACSigner(SIGNER_KEY.toByteArray()))
            return jwsObject.serialize()

        } catch (e: JOSEException) {
            throw RuntimeException("Error while generating JWT token", e)
        }
    }
}