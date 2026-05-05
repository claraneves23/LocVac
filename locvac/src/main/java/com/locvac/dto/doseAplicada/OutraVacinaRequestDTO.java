package com.locvac.dto.doseAplicada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record OutraVacinaRequestDTO(
        @NotNull Long idPessoa,
        @NotBlank @Size(max = 150) String nomeVacina,
        LocalDate dataAplicacao,
        @Size(max = 30) String lote,
        @Size(max = 500) String observacao,
        @Size(max = 100) String nomeProfissional,
        @Size(max = 30) String registroProfissional,
        @Size(max = 150) String unidadeSaude
) {}
