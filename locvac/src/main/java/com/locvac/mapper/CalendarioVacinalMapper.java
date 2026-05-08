package com.locvac.mapper;

import com.locvac.dto.calendarioVacinal.CalendarioVacinalResponseDTO;
import com.locvac.model.associacao.CalendarioVacinal;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CalendarioVacinalMapper {

    public CalendarioVacinalResponseDTO toResponse(CalendarioVacinal c) {
        List<Long> gruposRiscoIds = c.getGruposRisco() != null
                ? c.getGruposRisco().stream().map(g -> g.getId()).toList()
                : List.of();
        return new CalendarioVacinalResponseDTO(
                c.getId(),
                c.getVacina() != null ? c.getVacina().getId() : null,
                c.getVacina() != null ? c.getVacina().getNome() : null,
                c.getFaixaEtariaMinMeses(),
                c.getFaixaEtariaMaxMeses(),
                c.getPublicoAlvo(),
                c.isObrigatoria(),
                c.getNumeroDose(),
                c.getDescricaoDose(),
                c.getOrdemExibicao(),
                gruposRiscoIds
        );
    }
}
