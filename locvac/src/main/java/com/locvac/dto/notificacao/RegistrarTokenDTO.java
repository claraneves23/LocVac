package com.locvac.dto.notificacao;

import jakarta.validation.constraints.NotBlank;

public record RegistrarTokenDTO(
        @NotBlank
        String token,
        String plataforma
) {}
