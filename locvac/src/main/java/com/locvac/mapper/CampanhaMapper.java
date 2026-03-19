package com.locvac.mapper;

import com.locvac.dto.campanha.CampanhaRequestDTO;
import com.locvac.dto.campanha.CampanhaResponseDTO;
import com.locvac.model.core.Campanha;
import org.springframework.stereotype.Component;

@Component
public class CampanhaMapper {

    public Campanha toEntity(CampanhaRequestDTO dto) {
        return new Campanha(
                dto.nome(),
                dto.doencaAlvo(),
                dto.dataInicio(),
                dto.dataFim(),
                dto.publicoAlvo(),
                dto.ativa()
        );
    }

    public CampanhaResponseDTO toResponse(Campanha campanha) {
        return new CampanhaResponseDTO(
                campanha.getId(),
                campanha.getNome(),
                campanha.getDataInicio(),
                campanha.getDataFim(),
                campanha.getPublicoAlvo(),
                campanha.isAtiva()
        );
    }
}
