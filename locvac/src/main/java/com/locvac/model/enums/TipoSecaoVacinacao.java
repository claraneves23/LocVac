package com.locvac.model.enums;

import java.util.Map;
import java.util.HashMap;

public enum TipoSecaoVacinacao {
    OBRIGATORIAS_PRIMEIRO_ANO(1, "Vacinas Obrigatórias - Primeiro Ano de Vida"),
    OUTRAS_VACINAS(2, "Outras Vacinas"),
    CAMPANHAS(3, "Campanhas");

    private final int codigo;
    private final String descricao;

    TipoSecaoVacinacao(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    private static final Map<Integer, TipoSecaoVacinacao> BY_CODIGO = new HashMap<>();
    private static final Map<String, TipoSecaoVacinacao> BY_DESCRICAO = new HashMap<>();

    static {
        for (TipoSecaoVacinacao tipo : values()) {
            BY_CODIGO.put(tipo.codigo, tipo);
            BY_DESCRICAO.put(tipo.descricao, tipo);
        }
    }

    public static TipoSecaoVacinacao getByCodigo(int codigo) {
        return BY_CODIGO.get(codigo);
    }

    public static TipoSecaoVacinacao getByDescricao(String descricao) {
        return BY_DESCRICAO.get(descricao);
    }
}
