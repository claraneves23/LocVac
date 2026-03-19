package com.locvac.model.associacao;

import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Vacina;
import com.locvac.model.enums.StatusAplicacao;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "agenda_vacinal")
public class AgendaVacinal {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_agenda")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_pessoa", nullable = false)
        private Pessoa pessoa;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_calendario", nullable = false)
        private CalendarioVacinal calendario;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_campanha")
        private Campanha campanha;

        @Column(name = "data_prevista", nullable = false)
        private LocalDate dataPrevista;

        @Enumerated(EnumType.STRING)
        @Column(name = "status_aplicacao", nullable = false)
        private StatusAplicacao status;

        public void setPessoa(Pessoa pessoa) {
                this.pessoa = pessoa;
        }

        public void setVacina(Vacina vacina) {
                this.vacina = vacina;
        }

        public void setCalendario(CalendarioVacinal calendario) {
                this.calendario = calendario;
        }

        public void setCampanha(Campanha campanha) {
                this.campanha = campanha;
        }

        public void setDataPrevista(LocalDate dataPrevista) {
                this.dataPrevista = dataPrevista;
        }

        public void setStatus(StatusAplicacao status) {
                this.status = status;
        }

        public String getId() {
                return id;
        }

        public Pessoa getPessoa() {
                return pessoa;
        }

        public Vacina getVacina() {
                return vacina;
        }

        public CalendarioVacinal getCalendario() {
                return calendario;
        }

        public Campanha getCampanha() {
                return campanha;
        }

        public LocalDate getDataPrevista() {
                return dataPrevista;
        }

        public StatusAplicacao getStatus() {
                return status;
        }
}
