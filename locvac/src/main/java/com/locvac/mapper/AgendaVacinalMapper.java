package com.locvac.mapper;

import com.locvac.dto.agendaVacinal.AgendaVacinalResponseDTO;
import com.locvac.model.associacao.AgendaVacinal;
import org.springframework.stereotype.Component;

@Component
public class AgendaVacinalMapper {

    public AgendaVacinalResponseDTO toResponse(AgendaVacinal a) {
        return new AgendaVacinalResponseDTO(
                a.getId(),
                a.getPessoa() != null ? a.getPessoa().getId() : null,
                a.getPessoa() != null ? a.getPessoa().getNome() : null,
                a.getVacina() != null ? a.getVacina().getId() : null,
                a.getVacina() != null ? a.getVacina().getNome() : null,
                a.getCalendario() != null ? a.getCalendario().getId() : null,
                a.getCampanha() != null ? a.getCampanha().getId() : null,
                a.getCampanha() != null ? a.getCampanha().getNome() : null,
                a.getDataPrevista(),
                a.getStatus()
        );
    }
}
