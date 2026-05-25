package com.locvac.dto.pessoa;

import jakarta.validation.constraints.NotBlank;

public record PessoaFotoRequestDTO(
        @NotBlank(message = "dataUrl é obrigatório")
        String dataUrl
) {}
