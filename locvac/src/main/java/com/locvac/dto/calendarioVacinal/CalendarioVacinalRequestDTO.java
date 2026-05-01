package com.locvac.dto.calendarioVacinal;

import jakarta.validation.constraints.NotNull;

public record CalendarioVacinalRequestDTO(
        @NotNull
        Long idVacina,
        @NotNull
        Integer faixaEtariaMinMeses,
        @NotNull
        Integer faixaEtariaMaxMeses,
        String publicoAlvo,
        @NotNull
        Boolean obrigatoria,
        @NotNull
        String numeroDose,
        String descricaoDose,
        String ordemExibicao
) {}
