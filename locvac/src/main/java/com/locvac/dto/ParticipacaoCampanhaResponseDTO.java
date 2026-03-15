package com.locvac.dto;

import java.time.LocalDate;

public record ParticipacaoCampanhaResponseDTO(
        String id,
        Long pessoaId,
        Long campanhaId,
        LocalDate dataParticipacao
) {
}
