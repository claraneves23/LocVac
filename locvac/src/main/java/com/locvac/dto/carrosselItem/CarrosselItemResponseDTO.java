package com.locvac.dto.carrosselItem;

public record CarrosselItemResponseDTO(
        Long id,
        String titulo,
        String descricao,
        String imagemUrl,
        Integer ordemExibicao,
        boolean ativo
) {}
