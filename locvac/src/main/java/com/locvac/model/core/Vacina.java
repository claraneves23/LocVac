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

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false, length = 50)
    private String dose;

    @Column(name = "via_administracao", length = 50)
    private String viaAdministracao;

    @Column(name = "codigo_pni", unique = true, length = 20)
    private String codigoPNI;

    @Column(nullable = false)
    private boolean ativa;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_secao_vacinacao", nullable = false)
    private TipoSecaoVacinacao tipoSecaoVacinacao;

    @Column(name = "idade_minima_meses")
    private Integer idadeMinimaMeses;

    @Column(name = "idade_maxima_meses")
    private Integer idadeMaximaMeses;

    public Vacina() {}

    public Vacina(Long id) {
        this.id = id;
    }

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

    public Integer getIdadeMinimaMeses() {
        return idadeMinimaMeses;
    }

    public void setIdadeMinimaMeses(Integer idadeMinimaMeses) {
        this.idadeMinimaMeses = idadeMinimaMeses;
    }

    public Integer getIdadeMaximaMeses() {
        return idadeMaximaMeses;
    }

    public void setIdadeMaximaMeses(Integer idadeMaximaMeses) {
        this.idadeMaximaMeses = idadeMaximaMeses;
    }
}
