package com.osgang.backend.repository

import com.osgang.backend.entity.InvalidToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface InvalidTokenRepository : JpaRepository<InvalidToken, String> {

    fun findByJwtToken(token: String): InvalidToken?

    fun existsByJwtToken(token: String): Boolean

    fun deleteByExpiryTimeBefore(time: LocalDateTime)
}