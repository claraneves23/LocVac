package com.locvac.dto.participacaoCampanha;

import java.time.LocalDate;

public record ParticipacaoCampanhaResponseDTO(
        Long id,
        Long idPessoa,
        String nomePessoa,
        Long idCampanha,
        String nomeCampanha,
        LocalDate dataParticipacao
) {}