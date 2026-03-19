package com.locvac.service;

import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;

import java.util.List;

public interface PessoaService {

    PessoaResponseDTO cadastrar(PessoaRequestDTO dto);

    List<PessoaResponseDTO> listarTodos();
}
