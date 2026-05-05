package com.locvac.dto.campanha;

import com.locvac.model.enums.PublicoAlvo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CampanhaRequestDTO(
        @NotNull
        @Size(max = 100)
        String nome,
        @NotNull
        @Size(max = 100)
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

