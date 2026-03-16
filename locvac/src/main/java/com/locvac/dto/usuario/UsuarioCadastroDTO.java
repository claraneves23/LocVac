package com.locvac.dto.usuario;

public record UsuarioCadastroDTO(
        String nome,
        String email,
        String senha,
        String telefone
) {}