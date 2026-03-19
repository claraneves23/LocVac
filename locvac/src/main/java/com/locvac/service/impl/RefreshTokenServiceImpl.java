package com.locvac.service.impl;

import com.locvac.model.core.RefreshToken;
import com.locvac.model.core.Usuario;
import com.locvac.repository.RefreshTokenRepository;
import com.locvac.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${jwt.expiration.refresh}")
    private long expirationRefresh;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public String criarRefreshToken(Usuario usuario) {
        byte[] bytes = new byte[64];
        new SecureRandom().nextBytes(bytes);
        String tokenBruto = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setTokenHash(gerarHash(tokenBruto));
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(expirationRefresh / 1000));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        return tokenBruto;
    }

    @Override
    public Optional<RefreshToken> validar(String tokenBruto) {
        String hash = gerarHash(tokenBruto);

        return refreshTokenRepository.findByTokenHash(hash)
                .filter(t -> !t.isRevoked())
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Override
    public void revogar(String tokenBruto) {
        String hash = gerarHash(tokenBruto);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    @Override
    public void revogarTodos(Usuario usuario) {
        refreshTokenRepository.deleteAllByUsuario(usuario);
    }

    private String gerarHash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar hash do token", e);
        }
    }
}