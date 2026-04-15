package com.locvac.model.enums;

import java.util.Arrays;

public enum TipoVinculo {
    TITULAR(1, "Titular"),
    RESPONSAVEL(2, "Responsável"),
    DEPENDENTE(3, "Dependente");

    private final int codigo;
    private final String descricao;

    TipoVinculo(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static TipoVinculo getByCodigo(int codigo) {
        return Arrays.stream(values())
                .filter(tipo -> tipo.codigo == codigo)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Código de tipo de vínculo inválido: " + codigo));
    }
}
