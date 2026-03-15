package com.locvac.dto.auth;

import java.util.UUID;

public record TokenData(
        UUID usuarioId,
        String email
) {}