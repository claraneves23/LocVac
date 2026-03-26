package com.locvac.service;

import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaResponseDTO;

import java.util.List;

public interface ParticipacaoCampanhaService {
    ParticipacaoCampanhaResponseDTO cadastrar(ParticipacaoCampanhaRequestDTO dto);

    List<ParticipacaoCampanhaResponseDTO> listarTodos();

    List<ParticipacaoCampanhaResponseDTO> listarPorPessoa(Long idPessoa);
}
