package com.locvac.dto.participacaoCampanha;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ParticipacaoCampanhaRequestDTO(

        @NotNull(message = "O ID da pessoa é obrigatório")
        Long idPessoa,

        @NotNull(message = "O ID da campanha é obrigatório")
        Long idCampanha,

        @NotNull(message = "A data de participação é obrigatória")
        LocalDate dataParticipacao
) {}
