package com.locvac.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaDTO(

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "O código é obrigatório")
        @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos")
        String codigo,

        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        String novaSenha
) {}
