package com.locvac.service;

import com.locvac.dto.vacina.VacinaRequestDTO;
import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.model.enums.TipoSecaoVacinacao;

import java.util.List;

public interface VacinaService {

    VacinaResponseDTO criar(VacinaRequestDTO dto);

    List<VacinaResponseDTO> listar(TipoSecaoVacinacao tipo);
}
