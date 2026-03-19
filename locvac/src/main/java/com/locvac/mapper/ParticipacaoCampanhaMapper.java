package com.locvac.mapper;

import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaResponseDTO;
import com.locvac.model.associacao.ParticipacaoCampanha;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import org.springframework.stereotype.Component;


@Component
public class ParticipacaoCampanhaMapper {

    public ParticipacaoCampanha toEntity(ParticipacaoCampanhaRequestDTO dto) {
        ParticipacaoCampanha participacao = new ParticipacaoCampanha();
        participacao.setPessoa(new Pessoa(dto.idPessoa()));
        participacao.setCampanha(new Campanha(dto.idCampanha()));
        participacao.setDataParticipacao(dto.dataParticipacao());
        return participacao;
    }

    public ParticipacaoCampanhaResponseDTO toResponse(ParticipacaoCampanha participacao) {
        return new ParticipacaoCampanhaResponseDTO(
                participacao.getId(),
                participacao.getPessoa().getId(),
                participacao.getPessoa().getNome(),
                participacao.getCampanha().getId(),
                participacao.getCampanha().getNome(),
                participacao.getDataParticipacao()
        );
    }
}
