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
import com.osgang.backend.entity.InvalidToken
import com.osgang.backend.exception.AppException
import com.osgang.backend.exception.ErrorCode
import com.osgang.backend.repository.InvalidTokenRepository
import com.osgang.backend.repository.UserRepository

import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.util.Date
import java.util.UUID

@Service
class AuthenticationService (
    val userRepository: UserRepository,
    private val invalidTokenRepository: InvalidTokenRepository,
    @Value("\${JWT_SIGNER_KEY}") val SIGNER_KEY: String
) {

    fun logout(jwttoken: String) {
        val jwt = SignedJWT.parse(jwttoken)

        val verifier = MACVerifier(SIGNER_KEY.toByteArray())

        if (!jwt.verify(verifier)){
            throw AppException(ErrorCode.JWT__INVALID_TOKEN)
        }

        val userName = jwt.jwtClaimsSet.subject


        val expirationtime = jwt.jwtClaimsSet.expirationTime

        invalidTokenRepository.save(
            InvalidToken(
                jwtToken = jwttoken,
                expiryTime = expirationtime.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime()
            )
        )
    }



    fun introspect(request: IntrospectRequest): IntrospectResponse {
        val jwtToken = request.jwtToken

        val verifier = MACVerifier(SIGNER_KEY.toByteArray())

        val signedJWT = SignedJWT.parse(jwtToken)

        val expirationTime = signedJWT.jwtClaimsSet.expirationTime

        val isVerified = signedJWT.verify(verifier)

        if (!isVerified) {
            throw AppException(ErrorCode.JWT__INVALID_TOKEN)
        }

        val isInvalidated = invalidTokenRepository.existsByJwtToken(jwtToken)

        return IntrospectResponse(
                isValid = isVerified && expirationTime.after(Date()) && !isInvalidated
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

        val userId = user.userId
        val jwtToken = generateJWTToken(userId!!)

        return AuthenticationResponse(
            jwtToken,
            true,
            user.username,
        )
    }

    fun generateJWTToken(userId: UUID): String {
        val jwsHeader = JWSHeader(JWSAlgorithm.HS256)

        val jwtClaimset = JWTClaimsSet.Builder()
            .subject(userId.toString())
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

    fun extractUserId(jwtToken: String): String {
        try {
            val signedJWT = SignedJWT.parse(jwtToken)
            return signedJWT.jwtClaimsSet.subject
        } catch (e: JOSEException) {
            throw AppException(ErrorCode.JWT__INVALID_TOKEN)
        }
    }
}
