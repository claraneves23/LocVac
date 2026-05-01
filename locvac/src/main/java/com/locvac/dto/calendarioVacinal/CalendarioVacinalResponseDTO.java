package com.locvac.dto.calendarioVacinal;

public record CalendarioVacinalResponseDTO(
        Long id,
        Long idVacina,
        String nomeVacina,
        Integer faixaEtariaMinMeses,
        Integer faixaEtariaMaxMeses,
        String publicoAlvo,
        boolean obrigatoria,
        String numeroDose,
        String descricaoDose,
        String ordemExibicao
) {}
