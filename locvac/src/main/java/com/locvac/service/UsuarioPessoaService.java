package com.locvac.service;

import com.locvac.dto.usuarioPessoa.UsuarioPessoaRequestDTO;
import com.locvac.dto.usuarioPessoa.UsuarioPessoaResponseDTO;

import java.util.List;

public interface UsuarioPessoaService {
    UsuarioPessoaResponseDTO cadastrar(UsuarioPessoaRequestDTO dto);
    List<UsuarioPessoaResponseDTO> listarTodos();
    UsuarioPessoaResponseDTO buscarPorId(String id);
    void remover(String id);
}
