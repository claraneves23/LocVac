package com.locvac.dto.vacinaInformativo;

import java.time.LocalDate;

public class VacinaInformativoRequestDTO {
    private Long idVacina;
    private Integer versao;
    private LocalDate dataPublicacao;
    private String orgaoEmissor;
    private String fonteReferencia;

    // Getters and Setters
    public Long getIdVacina() {
        return idVacina;
    }

    public void setIdVacina(Long idVacina) {
        this.idVacina = idVacina;
    }

    public Integer getVersao() {
        return versao;
    }

    public void setVersao(Integer versao) {
        this.versao = versao;
    }

    public LocalDate getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(LocalDate dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public String getOrgaoEmissor() {
        return orgaoEmissor;
    }

    public void setOrgaoEmissor(String orgaoEmissor) {
        this.orgaoEmissor = orgaoEmissor;
    }

    public String getFonteReferencia() {
        return fonteReferencia;
    }

    public void setFonteReferencia(String fonteReferencia) {
        this.fonteReferencia = fonteReferencia;
    }
}