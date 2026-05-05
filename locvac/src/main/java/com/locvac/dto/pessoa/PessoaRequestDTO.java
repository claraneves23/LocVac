package com.locvac.dto.pessoa;

import com.locvac.model.enums.Estado;
import com.locvac.model.enums.Sexo;
import com.locvac.validation.annotation.ValidCns;
import com.locvac.validation.annotation.ValidCpf;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PessoaRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 100)
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

        @Size(max = 200)
        String rua,

        @Size(max = 100)
        String complemento,

        @Size(max = 100)
        String municipio,

        Estado estado,

        @NotBlank(message = "O telefone é obrigatório")
        @Pattern(regexp = "\\d{10,11}", message = "Telefone inválido")
        String telefone,

        @Size(max = 500)
        String fotoUrl,

        @Size(max = 100)
        String nomeResponsavel,

        @NotNull(message = "O campo ativo é obrigatório")
        boolean ativo
) {}