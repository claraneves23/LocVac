package com.locvac.model.associacao;

import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "participacao_campanha")
public class ParticipacaoCampanha {

    @Id
    @Column(name = "id_participacao")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pessoa", nullable = false)
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_campanha", nullable = false)
    private Campanha campanha;

    @Column(name = "data_participacao")
    private LocalDate dataParticipacao;

    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    public void setCampanha(Campanha campanha) {
        this.campanha = campanha;
    }

    public void setDataParticipacao(LocalDate dataParticipacao) {
        this.dataParticipacao = dataParticipacao;
    }

    public String getId() {
        return id;
    }

    public Pessoa getPessoa() {
        return pessoa;
    }

    public Campanha getCampanha() {
        return campanha;
    }

    public LocalDate getDataParticipacao() {
        return dataParticipacao;
    }
}
