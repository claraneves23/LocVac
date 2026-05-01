package com.locvac.dto.agendaVacinal;

import com.locvac.model.enums.StatusAplicacao;

import java.time.LocalDate;

public record AgendaVacinalResponseDTO(
        Long id,
        Long idPessoa,
        String nomePessoa,
        Long idVacina,
        String nomeVacina,
        Long idCalendario,
        Long idCampanha,
        String nomeCampanha,
        LocalDate dataPrevista,
        StatusAplicacao status
) {}
