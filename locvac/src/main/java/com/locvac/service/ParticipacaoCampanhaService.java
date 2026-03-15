package com.locvac.service;

import com.locvac.dto.ParticipacaoCampanhaPatchDTO;
import com.locvac.dto.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.ParticipacaoCampanhaResponseDTO;
import com.locvac.model.associacao.ParticipacaoCampanha;

import java.util.List;

public interface ParticipacaoCampanhaService {

    void cadastrarParticipacaoCampanha(ParticipacaoCampanhaRequestDTO dto);

    List<ParticipacaoCampanhaResponseDTO> listarParticipacoesCampanha();

    ParticipacaoCampanha buscarPorId(String id);

    void removerParticipacaoCampanha(String id);

}
