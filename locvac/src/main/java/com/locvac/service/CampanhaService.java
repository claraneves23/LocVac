package com.locvac.service;

import com.locvac.dto.CampanhaPatchDTO;
import com.locvac.dto.CampanhaRequestDTO;
import com.locvac.dto.CampanhaResponseDTO;
import com.locvac.model.core.Campanha;

import java.util.List;

public interface CampanhaService {

    void cadastrarCampanha(CampanhaRequestDTO dto);

    List<CampanhaResponseDTO> listarCampanhas();

    Campanha buscarPorId(Long id);

    void removerCampanha(Long id);

    void atualizarCampanha(Long id, CampanhaPatchDTO dto);
}
