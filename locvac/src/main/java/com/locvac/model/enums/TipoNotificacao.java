package com.locvac.model.enums;

public enum TipoNotificacao {

    PROXIMA_VACINA(1),
    NOVA_CAMPANHA(2),
    VACINA_ATRASADA(3);

    private final int codigo;

    TipoNotificacao(int codigo) {
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }

    public static TipoNotificacao fromCodigo(int codigo) {
        for (TipoNotificacao tipo : TipoNotificacao.values()) {
            if (tipo.codigo == codigo) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Código de notificação inválido: " + codigo);
    }
}