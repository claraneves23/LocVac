package com.locvac.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SolicitarRecuperacaoSenhaDTO(

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        String email
) {}
