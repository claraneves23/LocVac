package com.locvac.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IniciarCadastroDTO(

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        @Size(max = 254)
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, max = 72)
        String senha
) {}
