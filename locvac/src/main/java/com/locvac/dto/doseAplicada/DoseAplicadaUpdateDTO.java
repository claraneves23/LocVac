package com.locvac.dto.doseAplicada;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DoseAplicadaUpdateDTO(
        @NotNull LocalDate dataAplicacao,
        String lote,
        String observacao,
        String nomeProfissional,
        String registroProfissional,
        String unidadeSaude
) {}
