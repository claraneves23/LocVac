package com.locvac.dto.vacinaEfeitoColateral;

import com.locvac.model.enums.Severidade;

public class VacinaEfeitoColateralRequestDTO {
    private Long idVacina;
    private String descricao;
    private Severidade severidade;
    private String orientacao;

    // Getters and Setters
    public Long getIdVacina() {
        return idVacina;
    }

    public void setIdVacina(Long idVacina) {
        this.idVacina = idVacina;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Severidade getSeveridade() {
        return severidade;
    }

    public void setSeveridade(Severidade severidade) {
        this.severidade = severidade;
    }

    public String getOrientacao() {
        return orientacao;
    }

    public void setOrientacao(String orientacao) {
        this.orientacao = orientacao;
    }
}