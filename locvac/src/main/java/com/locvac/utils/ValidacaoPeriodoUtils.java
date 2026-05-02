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

    public static void validarIdadeMinimaMenorQueMaxima(Integer idadeMinimaMeses, Integer idadeMaximaMeses) {

        if (idadeMinimaMeses == null || idadeMaximaMeses == null) {
            return;
        }

        if (idadeMinimaMeses >= idadeMaximaMeses) {
            throw new IllegalArgumentException("A idade mínima em meses deve ser menor que a idade máxima em meses");
        }
    }
}