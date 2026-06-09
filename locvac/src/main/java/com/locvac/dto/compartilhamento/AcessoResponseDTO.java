package com.locvac.dto.compartilhamento;

import java.time.LocalDate;

public record AcessoResponseDTO(
        Long idUsuarioPessoa,
        String usuarioNome,
        String usuarioEmail,
        String tipoVinculo,
        boolean podeEditar,
        LocalDate dataVinculo,
        boolean ehVoce
) {}
