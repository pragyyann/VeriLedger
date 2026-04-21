package com.veriledger.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long EXPIRY_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    private SecretKey cachedKey;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.cachedKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey key() {
        return cachedKey;
    }

    public String generateToken(String userId, String email, String name, String picture) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("name", name)
                .claim("picture", picture)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(key())
                .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
