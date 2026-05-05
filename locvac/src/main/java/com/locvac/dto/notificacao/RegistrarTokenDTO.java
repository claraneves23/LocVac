package com.locvac.dto.notificacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrarTokenDTO(
        @NotBlank
        @Size(max = 512)
        String token,
        @Size(max = 32)
        String plataforma
) {}
