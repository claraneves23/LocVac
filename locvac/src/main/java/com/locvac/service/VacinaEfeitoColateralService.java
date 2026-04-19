package com.locvac.service;

import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralRequestDTO;
import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralResponseDTO;
import com.locvac.model.enums.Severidade;

import java.util.List;

public interface VacinaEfeitoColateralService {

    VacinaEfeitoColateralResponseDTO create(VacinaEfeitoColateralRequestDTO dto);

    VacinaEfeitoColateralResponseDTO update(Long id, VacinaEfeitoColateralRequestDTO dto);

    void delete(Long id);

    VacinaEfeitoColateralResponseDTO findById(Long id);

    List<VacinaEfeitoColateralResponseDTO> findByVacina(Long idVacina);

    List<VacinaEfeitoColateralResponseDTO> findBySeveridade(Severidade severidade);
}