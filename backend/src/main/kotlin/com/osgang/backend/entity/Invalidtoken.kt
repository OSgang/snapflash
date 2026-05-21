package com.osgang.backend.entity

//import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "invalid_jwt_tokens")
data class InvalidToken(

    @Id
    @Column(name = "id")
    val jwtToken: String,

    @Column(name = "expiry_time", nullable = false)
    val expiryTime: LocalDateTime
)