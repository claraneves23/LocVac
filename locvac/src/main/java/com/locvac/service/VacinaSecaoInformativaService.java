package com.locvac.service;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaRequestDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;

import java.util.List;

public interface VacinaSecaoInformativaService {

    VacinaSecaoInformativaResponseDTO create(VacinaSecaoInformativaRequestDTO dto);

    VacinaSecaoInformativaResponseDTO update(Long id, VacinaSecaoInformativaRequestDTO dto);

    void delete(Long id);

    VacinaSecaoInformativaResponseDTO findById(Long id);

    List<VacinaSecaoInformativaResponseDTO> findByInformativo(Long idInformativo);
}