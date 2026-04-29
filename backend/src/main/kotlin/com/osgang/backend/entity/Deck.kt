package com.osgang.backend.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "decks")
class Deck(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    @JsonIgnore
    var user: User,

    @Column(name = "deckname", nullable = false)
    var deckName: String,

    @Column(name = "description")
    var description: String? = null
) {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "deckid", updatable = false, nullable = false)
    var deckId: UUID? = null

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    var createdAt: LocalDateTime? = null

    @UpdateTimestamp
    @Column(name = "lastupdate")
    var lastUpdate: LocalDateTime? = null

    @OneToMany(mappedBy = "deck", cascade = [CascadeType.ALL], orphanRemoval = true)
    var flashcards: MutableList<Flashcard> = mutableListOf()
}