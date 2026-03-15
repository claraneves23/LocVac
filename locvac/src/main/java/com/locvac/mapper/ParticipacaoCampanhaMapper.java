package com.locvac.mapper;

import com.locvac.dto.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.ParticipacaoCampanhaResponseDTO;
import com.locvac.model.associacao.ParticipacaoCampanha;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import org.springframework.stereotype.Component;

@Component
public class ParticipacaoCampanhaMapper {

    public ParticipacaoCampanha toEntity(ParticipacaoCampanhaRequestDTO dto) {
        ParticipacaoCampanha participacao = new ParticipacaoCampanha();
        participacao.setPessoa(new Pessoa(dto.pessoaId()));
        participacao.setCampanha(new Campanha(dto.campanhaId()));
        participacao.setDataParticipacao(dto.dataParticipacao());
        return participacao;
    }

    public ParticipacaoCampanhaResponseDTO toResponse(ParticipacaoCampanha participacao) {
        return new ParticipacaoCampanhaResponseDTO(
                participacao.getId(),
                participacao.getPessoa().getId(),
                participacao.getCampanha().getId(),
                participacao.getDataParticipacao()
        );
    }
}
