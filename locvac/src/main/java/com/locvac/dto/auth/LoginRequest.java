package com.locvac.dto.auth;

public record LoginRequest(
        String email,
        String senha
) {}