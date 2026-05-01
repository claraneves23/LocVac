package com.locvac.service;

import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;

import java.util.List;

import java.util.UUID;

public interface PessoaService {

    PessoaResponseDTO cadastrar(PessoaRequestDTO dto);

    PessoaResponseDTO cadastrarTitular(PessoaRequestDTO dto);

    PessoaResponseDTO getPerfil(Long idPessoa);

    List<PessoaResponseDTO> listarTodos();

    List<PessoaResponseDTO> listarDependentes(UUID usuarioId);

    PessoaResponseDTO atualizar(Long id, PessoaRequestDTO dto);
}
