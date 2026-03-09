package com.locvac.model.core;

import com.locvac.model.enums.TipoSecaoVacinacao;
import jakarta.persistence.*;

@Entity
@Table(name = "vacina")
public class Vacina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacina")
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String dose;

    @Column(name = "via_administracao")
    private String viaAdministracao;

    @Column(name = "codigo_pni", unique = true)
    private String codigoPNI;

    @Column(nullable = false)
    private boolean ativa;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_secao_vacinacao", nullable = false)
    private TipoSecaoVacinacao tipoSecaoVacinacao;

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public void setViaAdministracao(String viaAdministracao) {
        this.viaAdministracao = viaAdministracao;
    }

    public void setCodigoPNI(String codigoPNI) {
        this.codigoPNI = codigoPNI;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public void setTipoSecaoVacinacao(TipoSecaoVacinacao tipoSecaoVacinacao) {
        this.tipoSecaoVacinacao = tipoSecaoVacinacao;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getDose() {
        return dose;
    }

    public String getViaAdministracao() {
        return viaAdministracao;
    }

    public String getCodigoPNI() {
        return codigoPNI;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public TipoSecaoVacinacao getTipoSecaoVacinacao() {
        return tipoSecaoVacinacao;
    }
}
