package com.locvac.service;

import com.locvac.dto.vacinaInformativo.VacinaInformativoRequestDTO;
import com.locvac.dto.vacinaInformativo.VacinaInformativoResponseDTO;

import java.util.List;

public interface VacinaInformativoService {

    VacinaInformativoResponseDTO create(VacinaInformativoRequestDTO dto);

    VacinaInformativoResponseDTO update(Long id, VacinaInformativoRequestDTO dto);

    void delete(Long id);

    VacinaInformativoResponseDTO findById(Long id);

    List<VacinaInformativoResponseDTO> findAll();

    List<VacinaInformativoResponseDTO> findByVacina(Long idVacina);
}