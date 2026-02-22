package com.locvac.model.associacao;

import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "agenda_vacinal")
public class AgendaVacinal {

        @Id
        @Column(name = "id_agenda")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_pessoa", nullable = false)
        private Pessoa pessoa;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_calendario")
        private CalendarioVacinal calendario;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_campanha")
        private Campanha campanha;

        @Column(name = "data_prevista")
        private LocalDate dataPrevista;

        @Column(name = "tipo_evento")
        private String tipoEvento;

        private String status;

}
