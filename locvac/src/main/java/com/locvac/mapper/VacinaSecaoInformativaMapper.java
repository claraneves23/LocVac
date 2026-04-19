package com.locvac.mapper;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaRequestDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;
import com.locvac.model.associacao.VacinaSecaoInformativa;
import org.springframework.stereotype.Component;

@Component
public class VacinaSecaoInformativaMapper {

    public VacinaSecaoInformativa toEntity(VacinaSecaoInformativaRequestDTO dto) {
        VacinaSecaoInformativa entity = new VacinaSecaoInformativa();
        // Note: VacinaInformativo would need to be fetched separately
        entity.setTituloSecao(dto.getTituloSecao());
        entity.setConteudo(dto.getConteudo());
        entity.setOrdemExibicao(dto.getOrdemExibicao());
        return entity;
    }

    public VacinaSecaoInformativaResponseDTO toResponse(VacinaSecaoInformativa entity) {
        VacinaSecaoInformativaResponseDTO dto = new VacinaSecaoInformativaResponseDTO();
        dto.setId(entity.getId());
        dto.setIdInformativo(entity.getInformativo().getId());
        dto.setTituloSecao(entity.getTituloSecao());
        dto.setConteudo(entity.getConteudo());
        dto.setOrdemExibicao(entity.getOrdemExibicao());
        return dto;
    }
}