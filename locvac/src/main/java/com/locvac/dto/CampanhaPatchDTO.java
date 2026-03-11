package com.locvac.dto;

import com.locvac.validation.annotation.PeloMenosUmCampo;

import java.time.LocalDate;

@PeloMenosUmCampo
public record CampanhaPatchDTO(
        String nome,
        String doencaAlvo,
        LocalDate dataInicio,
        LocalDate dataFim,
        String publicoAlvo,
        boolean ativa
) {
}


