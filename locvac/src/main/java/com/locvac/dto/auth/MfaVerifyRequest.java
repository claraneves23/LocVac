package com.locvac.dto.auth;

public record MfaVerifyRequest(
        String mfaToken,
        String codigo
) {}