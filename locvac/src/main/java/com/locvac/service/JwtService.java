package com.locvac.service;

import com.locvac.dto.auth.TokenData;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.access}")
    private long expirationAccess;

    @Value("${jwt.expiration.mfa}")
    private long expirationMfa;

    // -------------------------
    // Geração de tokens
    // -------------------------

    public String gerarAccessToken(TokenData dados) {
        return Jwts.builder()
            .subject(dados.usuarioId().toString())
            .claim("email", dados.email())
            .claim("tipo", "access")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationAccess))
            .signWith(getChave())
            .compact();
    }

    public String gerarMfaToken(TokenData dados) {
        return Jwts.builder()
            .subject(dados.usuarioId().toString())
            .claim("email", dados.email())
            .claim("tipo", "mfa")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMfa))
            .signWith(getChave())
            .compact();
    }

    // -------------------------
    // Validação e leitura
    // -------------------------

    public boolean isTokenValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenDoTipo(String token, String tipo) {
        try {
            String tipoClaim = (String) getClaims(token).get("tipo");
            return tipo.equals(tipoClaim);
        } catch (Exception e) {
            return false;
        }
    }

    public TokenData extrairDados(String token) {
        Claims claims = getClaims(token);
        return new TokenData(
                UUID.fromString(claims.getSubject()),
                (String) claims.get("email")
        );
    }

    // -------------------------
    // Interno
    // -------------------------

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getChave() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}