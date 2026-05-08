package com.locvac.service;

import com.locvac.dto.grupoRisco.GrupoRiscoRequestDTO;
import com.locvac.dto.grupoRisco.GrupoRiscoResponseDTO;

import java.util.List;

public interface GrupoRiscoService {
    GrupoRiscoResponseDTO criar(GrupoRiscoRequestDTO dto);
    List<GrupoRiscoResponseDTO> listar();
    GrupoRiscoResponseDTO buscarPorId(Long id);
    GrupoRiscoResponseDTO atualizar(Long id, GrupoRiscoRequestDTO dto);
    void remover(Long id);
}
