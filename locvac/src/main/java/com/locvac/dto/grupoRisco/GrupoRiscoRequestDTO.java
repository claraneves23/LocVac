package com.locvac.dto.grupoRisco;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GrupoRiscoRequestDTO(
        @NotBlank
        @Size(max = 100)
        String nome,
        @Size(max = 500)
        String descricao
) {}
