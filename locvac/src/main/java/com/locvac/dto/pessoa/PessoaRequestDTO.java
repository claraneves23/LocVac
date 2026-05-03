package com.locvac.dto.pessoa;

import com.locvac.model.enums.Estado;
import com.locvac.model.enums.Sexo;
import com.locvac.validation.ValidCns;
import com.locvac.validation.ValidCpf;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

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

        @ValidCns
        String cns,

        @NotBlank(message = "O CEP é obrigatório")
        @Pattern(regexp = "\\d{8}", message = "CEP inválido")
        String cep,

        String rua,

        String complemento,

        String municipio,

        Estado estado,

        @NotBlank(message = "O telefone é obrigatório")
        String telefone,

        String fotoUrl,

        String nomeResponsavel,

        @NotNull(message = "O campo ativo é obrigatório")
        boolean ativo
) {}