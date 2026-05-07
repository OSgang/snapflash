package com.osgang.backend.service

import com.osgang.backend.entity.ScanHistory
import com.osgang.backend.entity.User
import com.osgang.backend.repository.ScanHistoryRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ScanHistoryService(
    val scanHistoryRepository: ScanHistoryRepository,
) {
    fun getById(scanId: UUID): ScanHistory {
        return scanHistoryRepository.getReferenceById(scanId)
    }

    fun addScanHistory(user: User, str: String?, text: String?) {
        scanHistoryRepository.save(ScanHistory(user, str, text))
    }

    fun getAllFromUser(user: User): List<ScanHistory> {
        return scanHistoryRepository.findByUserUserIdOrderByCreatedAtDesc(user.userId!!)
    }
}