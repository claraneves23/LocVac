package com.locvac.model.enums;

import java.util.Arrays;

public enum Sexo {

    MASCULINO(1, "Masculino"),
    FEMININO(2, "Feminino");

    private final int codigo;
    private final String descricao;

    Sexo(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static Sexo getByCodigo(int codigo) {
        return Arrays.stream(values())
                .filter(sexo -> sexo.codigo == codigo)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Código de sexo inválido: " + codigo));
    }

}