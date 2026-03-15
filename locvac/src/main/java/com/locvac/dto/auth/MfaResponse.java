package com.locvac.dto.auth;

public record MfaResponse(
        String mfaToken,
        String mensagem
) {}