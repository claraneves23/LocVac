package com.locvac.mapper;

import com.locvac.dto.grupoRisco.GrupoRiscoResponseDTO;
import com.locvac.model.core.GrupoRisco;
import org.springframework.stereotype.Component;

@Component
public class GrupoRiscoMapper {

    public GrupoRiscoResponseDTO toResponse(GrupoRisco g) {
        return new GrupoRiscoResponseDTO(g.getId(), g.getNome(), g.getDescricao());
    }
}
