package com.locvac.dto.vacinaSecaoInformativa;

import jakarta.validation.constraints.Size;

public class VacinaSecaoInformativaRequestDTO {
    private Long idInformativo;
    @Size(max = 150)
    private String tituloSecao;
    private String conteudo;
    private Integer ordemExibicao;

    // Getters and Setters
    public Long getIdInformativo() {
        return idInformativo;
    }

    public void setIdInformativo(Long idInformativo) {
        this.idInformativo = idInformativo;
    }

    public String getTituloSecao() {
        return tituloSecao;
    }

    public void setTituloSecao(String tituloSecao) {
        this.tituloSecao = tituloSecao;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }
}