package com.locvac.model.enums;

public enum Severidade {
    LEVE(1, "Leve"),
    MODERADA(2, "Moderada"),
    GRAVE(3, "Grave");

    private final int codigo;
    private final String descricao;

    Severidade(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static Severidade getByCodigo(int codigo) {
        for (Severidade s : values()) {
            if (s.codigo == codigo) {
                return s;
            }
        }
        throw new IllegalArgumentException("Código de severidade inválido: " + codigo);
    }
}
