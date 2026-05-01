package com.locvac.service;

import com.locvac.dto.agendaVacinal.AgendaVacinalRequestDTO;
import com.locvac.dto.agendaVacinal.AgendaVacinalResponseDTO;

import java.util.List;

public interface AgendaVacinalService {

    AgendaVacinalResponseDTO criar(AgendaVacinalRequestDTO dto);

    List<AgendaVacinalResponseDTO> listar();

    List<AgendaVacinalResponseDTO> listarPorPessoa(Long idPessoa);

    AgendaVacinalResponseDTO buscarPorId(Long id);

    AgendaVacinalResponseDTO atualizar(Long id, AgendaVacinalRequestDTO dto);

    void remover(Long id);
}
