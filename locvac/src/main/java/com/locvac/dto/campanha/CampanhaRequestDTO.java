package com.locvac.dto.campanha;

import com.locvac.model.enums.PublicoAlvo;
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
        PublicoAlvo publicoAlvo,
        @NotNull
        boolean ativa
) {
}

