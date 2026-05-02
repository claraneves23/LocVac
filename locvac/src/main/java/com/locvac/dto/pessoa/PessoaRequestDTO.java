package com.locvac.dto.pessoa;

import com.locvac.model.enums.Sexo;
import com.locvac.validation.ValidCpf;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PessoaRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotNull(message = "A data de nascimento é obrigatória")
        LocalDate dataNascimento,

        @ValidCpf
        String cpf,

        @NotNull(message = "O sexo biológico é obrigatório")
        Sexo sexoBiologico,

        // validar formato do CNS e se existe cns duplicado cadastrado
        String cns,

        // validar formato de cep
        @NotBlank(message = "O CEP é obrigatório")
        String cep,


        // validar formato de telefone
        @NotBlank(message = "O telefone é obrigatório")
        String telefone,

        String fotoUrl,

        String nomeResponsavel,

        @NotNull(message = "O campo ativo é obrigatório")
        boolean ativo
) {}