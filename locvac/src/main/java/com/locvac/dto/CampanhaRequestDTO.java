package com.locvac.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CampanhaRequestDTO(
        @NotNull
        String nome,
        @NotNull
        String doencaAlvo,
        @NotNull
        LocalDate dataInicio,
        @NotNull
        LocalDate dataFim,
        @NotNull
        String publicoAlvo,
        @NotNull
        boolean ativa
) {
}

