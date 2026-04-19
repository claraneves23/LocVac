package com.locvac.dto.doseAplicada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record OutraVacinaRequestDTO(
        @NotNull Long idPessoa,
        @NotBlank String nomeVacina,
        LocalDate dataAplicacao,
        String lote,
        String observacao,
        String nomeProfissional,
        String registroProfissional,
        String unidadeSaude
) {}
