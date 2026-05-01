package com.locvac.service;

import com.locvac.dto.calendarioVacinal.CalendarioVacinalRequestDTO;
import com.locvac.dto.calendarioVacinal.CalendarioVacinalResponseDTO;

import java.util.List;

public interface CalendarioVacinalService {

    CalendarioVacinalResponseDTO criar(CalendarioVacinalRequestDTO dto);

    List<CalendarioVacinalResponseDTO> listar();

    CalendarioVacinalResponseDTO buscarPorId(Long id);

    CalendarioVacinalResponseDTO atualizar(Long id, CalendarioVacinalRequestDTO dto);

    void remover(Long id);
}
