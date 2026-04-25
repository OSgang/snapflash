package com.osgang.backend.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Column(name = "email", nullable = false, unique = true)
    var email: String,

    @Column(name = "username", nullable = false)
    var username: String,

    @Column(name = "password_hash", nullable = false)
    var passwordHash: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "userid", updatable = false, nullable = false)
    var userId: UUID? = null

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    var createdAt: LocalDateTime? = null

    // Bidirectional relationships (optional, but helpful for graph traversal)
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    var decks: MutableList<Deck> = mutableListOf()

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    var scanHistories: MutableList<ScanHistory> = mutableListOf()
}