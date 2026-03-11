package com.locvac.model.enums;

public enum Fabricante {

    FIIOCROZ(1, "Fiocruz"),
    BUTANTAN(2, "Instituto Butantan"),
    GSK(3, "GlaxoSmithKline"),
    SANOFI(4, "Sanofi"),
    PFIZER(5, "Pfizer"),
    MERCK(6, "Merck & Co. (MSD)"),
    JANSSEN(7, "Johnson & Johnson (Janssen)"),
    TAKEDA(8, "Takeda"),
    SINOVAC(9, "Sinovac Biotech"),
    ASTRAZENECA(10, "AstraZeneca"),
    SERUM_INSTITUTE(11, "Serum Institute of India"),
    OUTRO(99, "Outro");

    private final int codigo;
    private final String descricao;

    Fabricante(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static Fabricante getByCodigo(int codigo) {
        for (Fabricante fabricante : values()) {
            if (fabricante.codigo == codigo) {
                return fabricante;
            }
        }
        throw new IllegalArgumentException("Código de fabricante inválido: " + codigo);
    }
}
