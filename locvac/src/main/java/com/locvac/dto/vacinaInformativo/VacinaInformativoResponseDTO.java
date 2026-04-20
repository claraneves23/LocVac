package com.locvac.dto.vacinaInformativo;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;

import java.time.LocalDate;
import java.util.List;

public class VacinaInformativoResponseDTO {
    private Long id;
    private Long idVacina;
    private String nomeVacina;
    private Integer versao;
    private LocalDate dataPublicacao;
    private String orgaoEmissor;
    private String fonteReferencia;
    private List<VacinaSecaoInformativaResponseDTO> secoes;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdVacina() {
        return idVacina;
    }

    public void setIdVacina(Long idVacina) {
        this.idVacina = idVacina;
    }

    public String getNomeVacina() {
        return nomeVacina;
    }

    public void setNomeVacina(String nomeVacina) {
        this.nomeVacina = nomeVacina;
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

    public List<VacinaSecaoInformativaResponseDTO> getSecoes() {
        return secoes;
    }

    public void setSecoes(List<VacinaSecaoInformativaResponseDTO> secoes) {
        this.secoes = secoes;
    }
}