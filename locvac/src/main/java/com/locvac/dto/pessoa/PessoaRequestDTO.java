package com.locvac.dto.pessoa;

import com.locvac.model.enums.Sexo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PessoaRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotNull(message = "A data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String cpf,

        @NotNull(message = "O sexo biológico é obrigatório")
        Sexo sexoBiologico,

        String cns,

        @NotBlank(message = "O CEP é obrigatório")
        String cep,

        @NotBlank(message = "O telefone é obrigatório")
        String telefone,

        String fotoUrl,

        @NotBlank(message = "O nome do responsável é obrigatório")
        String nomeResponsavel,

        @NotNull(message = "O campo ativo é obrigatório")
        boolean ativo
) {}