package com.locvac.model.enums;

import java.time.LocalDate;
import java.time.Period;

public enum PublicoAlvo {

    INFANTIL(0, 11),
    ADOLESCENTE(12, 17),
    ADULTO(18, 59),
    IDOSO(60, null),
    TODOS(null, null);

    private final Integer idadeMinimaAnos;
    private final Integer idadeMaximaAnos;

    PublicoAlvo(Integer idadeMinimaAnos, Integer idadeMaximaAnos) {
        this.idadeMinimaAnos = idadeMinimaAnos;
        this.idadeMaximaAnos = idadeMaximaAnos;
    }

    public Integer getIdadeMinimaAnos() {
        return idadeMinimaAnos;
    }

    public Integer getIdadeMaximaAnos() {
        return idadeMaximaAnos;
    }

    public boolean inclui(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            return this == TODOS;
        }
        int idade = Period.between(dataNascimento, LocalDate.now()).getYears();
        return (idadeMinimaAnos == null || idade >= idadeMinimaAnos)
                && (idadeMaximaAnos == null || idade <= idadeMaximaAnos);
    }
}
