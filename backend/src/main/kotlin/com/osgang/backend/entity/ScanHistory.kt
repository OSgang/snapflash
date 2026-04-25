package com.osgang.backend.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "scanhistory")
class ScanHistory(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    var user: User,

    @Column(name = "imageurl")
    var imageUrl: String? = null,

    @Column(name = "extractedtext")
    var extractedText: String? = null
) {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "historyid", updatable = false, nullable = false)
    var historyId: UUID? = null

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    var createdAt: LocalDateTime? = null
}