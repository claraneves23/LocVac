package com.locvac.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ParticipacaoCampanhaRequestDTO(
        @NotNull
        Long pessoaId,
        @NotNull
        Long campanhaId,
        @NotNull
        LocalDate dataParticipacao
) {
}
