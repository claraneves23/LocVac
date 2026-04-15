package com.locvac.mapper;

import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;
import com.locvac.model.core.Pessoa;
import org.springframework.stereotype.Component;

@Component
public class PessoaMapper {

    public Pessoa toEntity(PessoaRequestDTO dto) {
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(dto.nome());
        pessoa.setDataNascimento(dto.dataNascimento());
        pessoa.setCpf(dto.cpf());
        pessoa.setSexoBiologico(dto.sexoBiologico());
        pessoa.setCns(dto.cns());
        pessoa.setCep(dto.cep());
        pessoa.setTelefone(dto.telefone());
        pessoa.setFotoUrl(dto.fotoUrl());
        pessoa.setNomeResponsavel(dto.nomeResponsavel());
        pessoa.setAtivo(dto.ativo());
        return pessoa;
    }

    // Novo método para dependentes, aceita parentesco
    public PessoaResponseDTO toResponse(Pessoa pessoa, String dscParentesco) {
        return new PessoaResponseDTO(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getDataNascimento(),
                pessoa.getCpf(),
                pessoa.getSexoBiologico(),
                pessoa.getCns(),
                pessoa.getCep(),
                pessoa.getTelefone(),
                pessoa.getFotoUrl(),
                pessoa.getNomeResponsavel(),
                pessoa.isAtivo(),
                dscParentesco
        );
    }

    // Mantém o antigo para usos gerais
    public PessoaResponseDTO toResponse(Pessoa pessoa) {
        return toResponse(pessoa, null);
    }
}
