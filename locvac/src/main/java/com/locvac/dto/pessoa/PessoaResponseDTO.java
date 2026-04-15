package com.locvac.dto.pessoa;

import com.locvac.model.enums.Sexo;

import java.time.LocalDate;

public record PessoaResponseDTO(
        Long id,
        String nome,
        LocalDate dataNascimento,
        String cpf,
        Sexo sexoBiologico,
        String cns,
        String cep,
        String telefone,
        String fotoUrl,
        String nomeResponsavel,
        boolean ativo,
        String dscParentesco
) {}
