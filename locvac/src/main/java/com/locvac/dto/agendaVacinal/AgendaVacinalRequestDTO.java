package com.locvac.dto.agendaVacinal;

import com.locvac.model.enums.StatusAplicacao;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AgendaVacinalRequestDTO(
        @NotNull
        Long idPessoa,
        @NotNull
        Long idVacina,
        @NotNull
        Long idCalendario,
        Long idCampanha,
        @NotNull
        LocalDate dataPrevista,
        @NotNull
        StatusAplicacao status
) {}
