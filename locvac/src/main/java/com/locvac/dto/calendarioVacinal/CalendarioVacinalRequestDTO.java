package com.locvac.dto.calendarioVacinal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CalendarioVacinalRequestDTO(
        @NotNull
        Long idVacina,
        @NotNull
        Integer faixaEtariaMinMeses,
        @NotNull
        Integer faixaEtariaMaxMeses,
        @Size(max = 200)
        String publicoAlvo,
        @NotNull
        Boolean obrigatoria,
        @NotNull
        @Size(max = 20)
        String numeroDose,
        @Size(max = 200)
        String descricaoDose,
        String ordemExibicao
) {}
