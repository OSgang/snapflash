package com.osgang.backend.controller

import com.osgang.backend.entity.ScanHistory
import com.osgang.backend.service.ScanHistoryService
import com.osgang.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

// TODO: REDO THE IMAGE SCAN IMPLEMENTATION
@RestController
@RequestMapping("/scan")
class ScanHistoryController(
    val scanHistoryService: ScanHistoryService,
    val userService: UserService
) {
    @GetMapping("/all")
    fun getHistoryAll(@CookieValue("user_id") userId: UUID): ResponseEntity<List<ScanHistory>> {

        val user = userService.getUserById(userId) ?: return ResponseEntity.notFound().build()

        return runCatching {
            ResponseEntity.ok(scanHistoryService.getAllFromUser(user))
        } .getOrElse {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable scanId: UUID): ResponseEntity<ScanHistory> {
        return runCatching {
            ResponseEntity.ok(scanHistoryService.getById(scanId))
        } .getOrElse {
            ResponseEntity.notFound().build()
        }
    }
}