package com.locvac.service;

import com.locvac.dto.pessoa.PessoaFotoResponseDTO;

public interface PessoaFotoService {

    PessoaFotoResponseDTO salvar(Long idPessoa, String dataUrl);

    PessoaFotoResponseDTO obter(Long idPessoa);

    void remover(Long idPessoa);
}
