package com.locvac.model.associacao;

import com.locvac.model.core.Vacina;
import com.locvac.model.enums.Severidade;
import jakarta.persistence.*;

@Entity
@Table(name = "vacina_efeito_colateral")
public class VacinaEfeitoColateral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_efeito_colateral")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vacina", nullable = false)
    private Vacina vacina;

    @Column(name = "descricao", nullable = false, length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "severidade", nullable = false)
    private Severidade severidade;

    @Column(name = "orientacao", nullable = false, length = 500)
    private String orientacao;

    public void setOrientacao(String orientacao) {
        this.orientacao = orientacao;
    }

    public void setSeveridade(Severidade severidade) {
        this.severidade = severidade;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setVacina(Vacina vacina) {
        this.vacina = vacina;
    }

    public Long getId() {
        return id;
    }

    public Vacina getVacina() {
        return vacina;
    }

    public String getDescricao() {
        return descricao;
    }

    public Severidade getSeveridade() {
        return severidade;
    }

    public String getOrientacao() {
        return orientacao;
    }
}



