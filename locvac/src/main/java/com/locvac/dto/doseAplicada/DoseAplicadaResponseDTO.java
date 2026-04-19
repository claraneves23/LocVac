package com.locvac.dto.doseAplicada;

import java.time.LocalDate;

public record DoseAplicadaResponseDTO(
        Long id,
        Long idPessoa,
        Long idVacina,
        String nomeVacina,
        LocalDate dataAplicacao,
        String lote,
        String observacao,
        String nomeProfissional,
        String registroProfissional,
        String unidadeSaude
) {}
