package com.locvac.model.core;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "campanha")
public class Campanha {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_campanha")
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "doenca_alvo", nullable = false)
    private String doencaAlvo;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(name = "publico_alvo", nullable = false)
    private String publicoAlvo;

    @Column(nullable = false)

    private boolean ativa;

    public Campanha() {}

    public Campanha(String nome, String doencaAlvo, LocalDate dataInicio, LocalDate dataFim, String publicoAlvo, boolean ativa) {
        this.nome = nome;
        this.doencaAlvo = doencaAlvo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.publicoAlvo = publicoAlvo;
        this.ativa = ativa;
    }

    public Campanha(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDoencaAlvo(String doencaAlvo) {
        this.doencaAlvo = doencaAlvo;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public void setPublicoAlvo(String publicoAlvo) {
        this.publicoAlvo = publicoAlvo;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDoencaAlvo() {
        return doencaAlvo;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public String getPublicoAlvo() {
        return publicoAlvo;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
