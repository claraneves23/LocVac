package com.locvac.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record ExcluirContaDTO(

        @NotBlank(message = "A senha é obrigatória para excluir a conta")
        String senha
) {}
