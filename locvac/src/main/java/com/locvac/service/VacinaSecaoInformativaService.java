package com.locvac.service;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaRequestDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;

import java.util.List;

public interface VacinaSecaoInformativaService {

    List<VacinaSecaoInformativaResponseDTO> create(List<VacinaSecaoInformativaRequestDTO> dtos);

    VacinaSecaoInformativaResponseDTO update(Long id, VacinaSecaoInformativaRequestDTO dto);

    void delete(Long id);

    VacinaSecaoInformativaResponseDTO findById(Long id);

    List<VacinaSecaoInformativaResponseDTO> findByInformativo(Long idInformativo);
}