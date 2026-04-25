package com.osgang.backend.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "flashcards")
class Flashcard(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deckid", nullable = false)
    var deck: Deck,

    @Column(name = "word", nullable = false)
    var word: String,

    @Column(name = "translation", nullable = false)
    var translation: String,

    @Column(name = "definition", nullable = false)
    var definition: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "flashcardid", updatable = false, nullable = false)
    var flashcardId: UUID? = null

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    var createdAt: LocalDateTime? = null

    @UpdateTimestamp
    @Column(name = "lastupdate")
    var lastUpdate: LocalDateTime? = null
}