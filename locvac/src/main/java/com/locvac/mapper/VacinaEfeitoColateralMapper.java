package com.locvac.mapper;

import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralRequestDTO;
import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralResponseDTO;
import com.locvac.model.associacao.VacinaEfeitoColateral;
import org.springframework.stereotype.Component;

@Component
public class VacinaEfeitoColateralMapper {

    public VacinaEfeitoColateral toEntity(VacinaEfeitoColateralRequestDTO dto) {
        VacinaEfeitoColateral entity = new VacinaEfeitoColateral();
        // Note: Vacina would need to be fetched separately
        entity.setDescricao(dto.getDescricao());
        entity.setSeveridade(dto.getSeveridade());
        entity.setOrientacao(dto.getOrientacao());
        return entity;
    }

    public VacinaEfeitoColateralResponseDTO toResponse(VacinaEfeitoColateral entity) {
        VacinaEfeitoColateralResponseDTO dto = new VacinaEfeitoColateralResponseDTO();
        dto.setId(entity.getId());
        dto.setIdVacina(entity.getVacina().getId());
        dto.setNomeVacina(entity.getVacina().getNome());
        dto.setDescricao(entity.getDescricao());
        dto.setSeveridade(entity.getSeveridade());
        dto.setOrientacao(entity.getOrientacao());
        return dto;
    }
}