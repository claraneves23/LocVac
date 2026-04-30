package com.locvac.dto.campanha;

import com.locvac.model.enums.PublicoAlvo;

import java.time.LocalDate;

public record CampanhaResponseDTO(
        Long id,
        String nome,
        LocalDate dataInicio,
        LocalDate dataFim,
        PublicoAlvo publicoAlvo,
        boolean ativa
) {
}

