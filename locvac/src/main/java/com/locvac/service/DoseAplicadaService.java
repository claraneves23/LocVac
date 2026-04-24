package com.locvac.service;

import com.locvac.dto.doseAplicada.DoseAplicadaRequestDTO;
import com.locvac.dto.doseAplicada.DoseAplicadaResponseDTO;
import com.locvac.dto.doseAplicada.DoseAplicadaUpdateDTO;
import com.locvac.dto.doseAplicada.OutraVacinaRequestDTO;
import com.locvac.model.enums.TipoSecaoVacinacao;

import java.util.List;

public interface DoseAplicadaService {
    DoseAplicadaResponseDTO registrar(DoseAplicadaRequestDTO dto);
    DoseAplicadaResponseDTO atualizar(Long idDose, DoseAplicadaUpdateDTO dto);
    void deletar(Long idDose);
    List<DoseAplicadaResponseDTO> listarPorPessoa(Long idPessoa);
    List<DoseAplicadaResponseDTO> listarPorPessoaETipo(Long idPessoa, TipoSecaoVacinacao tipo);
    DoseAplicadaResponseDTO registrarOutraVacina(OutraVacinaRequestDTO dto);
    DoseAplicadaResponseDTO atualizarOutraVacina(Long idDose, OutraVacinaRequestDTO dto);
}
