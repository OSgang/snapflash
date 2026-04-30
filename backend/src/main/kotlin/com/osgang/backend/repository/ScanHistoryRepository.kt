package com.osgang.backend.repository

import com.osgang.backend.entity.ScanHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ScanHistoryRepository : JpaRepository<ScanHistory, UUID> {

    // Fetch scan history for a specific user
    fun findByUserUserId(userId: UUID): List<ScanHistory>

    // Fetch scan history for a user, ordered by the most recent scans first
    fun findByUserUserIdOrderByCreatedAtDesc(userId: UUID): List<ScanHistory>
}