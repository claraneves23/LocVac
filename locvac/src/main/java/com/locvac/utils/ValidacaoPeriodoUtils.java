package com.locvac.utils;

import java.time.LocalDate;

public final class ValidacaoPeriodoUtils {

    private ValidacaoPeriodoUtils() {}

    public static void validarDataFinalPosterior(LocalDate dataInicio, LocalDate dataFim) {

        if (dataInicio == null || dataFim == null) {
            return;
        }

        if (!dataFim.isAfter(dataInicio)) {
            throw new IllegalArgumentException( "A data de fim deve ser posterior à data de início");
        }
    }
}