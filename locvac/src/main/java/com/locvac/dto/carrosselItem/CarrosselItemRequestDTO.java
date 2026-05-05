package com.locvac.dto.carrosselItem;

import jakarta.validation.constraints.Size;

public record CarrosselItemRequestDTO(
        @Size(max = 150) String titulo,
        @Size(max = 500) String descricao,
        @Size(max = 500) String imagemUrl,
        Integer ordemExibicao,
        boolean ativo
) {}
