package com.locvac.mapper;

import com.locvac.dto.vacinaInformativo.VacinaInformativoRequestDTO;
import com.locvac.dto.vacinaInformativo.VacinaInformativoResponseDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;
import com.locvac.model.associacao.VacinaInformativo;
import com.locvac.model.associacao.VacinaSecaoInformativa;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VacinaInformativoMapper {

    private final VacinaSecaoInformativaMapper secaoMapper;

    public VacinaInformativoMapper(VacinaSecaoInformativaMapper secaoMapper) {
        this.secaoMapper = secaoMapper;
    }

    public VacinaInformativo toEntity(VacinaInformativoRequestDTO dto) {
        VacinaInformativo entity = new VacinaInformativo();
        // Note: Vacina would need to be fetched separately, assuming idVacina is used to set it
        entity.setVersao(dto.getVersao());
        entity.setDataPublicacao(dto.getDataPublicacao());
        entity.setOrgaoEmissor(dto.getOrgaoEmissor());
        entity.setFonteReferencia(dto.getFonteReferencia());
        return entity;
    }

    public VacinaInformativoResponseDTO toResponse(VacinaInformativo entity) {
        VacinaInformativoResponseDTO dto = new VacinaInformativoResponseDTO();
        dto.setId(entity.getId());
        dto.setIdVacina(entity.getVacina().getId());
        dto.setNomeVacina(entity.getVacina().getNome());
        dto.setVersao(entity.getVersao());
        dto.setDataPublicacao(entity.getDataPublicacao());
        dto.setOrgaoEmissor(entity.getOrgaoEmissor());
        dto.setFonteReferencia(entity.getFonteReferencia());
        if (entity.getSecoes() != null) {
            List<VacinaSecaoInformativaResponseDTO> secoesDto = entity.getSecoes().stream()
                    .map(secaoMapper::toResponse)
                    .collect(Collectors.toList());
            dto.setSecoes(secoesDto);
        }
        return dto;
    }
}