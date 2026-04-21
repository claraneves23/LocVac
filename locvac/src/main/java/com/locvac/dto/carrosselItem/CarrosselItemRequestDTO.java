package com.locvac.dto.carrosselItem;

public record CarrosselItemRequestDTO(
        String titulo,
        String descricao,
        String imagemUrl,
        Integer ordemExibicao,
        boolean ativo
) {}
