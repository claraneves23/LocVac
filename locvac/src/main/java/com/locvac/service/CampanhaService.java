package com.locvac.service;

import com.locvac.dto.campanha.CampanhaRequestDTO;
import com.locvac.dto.campanha.CampanhaResponseDTO;
import com.locvac.model.core.Campanha;

import java.util.List;

public interface CampanhaService {

    void cadastrarCampanha(CampanhaRequestDTO dto);

    List<CampanhaResponseDTO> listarCampanhas();

    Campanha buscarPorId(Long id);

    void removerCampanha(Long id);

    CampanhaResponseDTO atualizarCampanha(Long id, CampanhaRequestDTO dto);

}
