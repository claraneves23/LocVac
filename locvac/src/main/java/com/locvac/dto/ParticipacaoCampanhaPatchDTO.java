package com.locvac.dto;

import java.time.LocalDate;

public record ParticipacaoCampanhaPatchDTO(
        Long pessoaId,
        Long campanhaId,
        LocalDate dataParticipacao
) {
}
