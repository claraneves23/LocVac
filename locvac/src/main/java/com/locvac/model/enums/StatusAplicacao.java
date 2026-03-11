package com.locvac.model.enums;

import java.util.Arrays;

public enum StatusAplicacao {

    APLICADA(1, "Aplicada"),
    ATRASADA(2, "Atrasada"),
    CANCELADA(3, "Cancelada");

    private final int codigo;
    private final String descricao;

    StatusAplicacao(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static StatusAplicacao fromCodigo(int codigo) {
        return Arrays.stream(values())
                .filter(status -> status.codigo == codigo)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Código de status inválido: " + codigo));
    }
}
