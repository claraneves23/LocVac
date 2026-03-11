package com.locvac.dto;

import java.time.LocalDate;

public record CampanhaResponseDTO(
        Long id,
        String nome,
        LocalDate dataInicio,
        LocalDate dataFim,
        String publicoAlvo,
        boolean ativa
) {
}

