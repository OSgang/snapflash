package com.osgang.backend.repository

import com.osgang.backend.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    
    // Finds a user by their unique email address
    fun findByEmail(email: String): User?
    
    // Quick check to see if an email is already registered
    fun existsByEmail(email: String): Boolean
    
    // Optional: Find by username if you plan to allow login via username
    fun findByUsername(username: String): User?
}