package com.locvac.dto.compartilhamento;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CriarConviteRequestDTO(
        @NotEmpty List<Long> idsPessoa,
        Integer validadeMinutos
) {}
