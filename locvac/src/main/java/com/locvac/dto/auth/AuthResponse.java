package com.locvac.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String nome,
        Long idPessoa
) {}