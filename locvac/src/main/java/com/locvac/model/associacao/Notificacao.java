package com.locvac.model.associacao;

import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "notificacao")
public class Notificacao {

        @Id
        @Column(name = "id_notificacao")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_usuario", nullable = false)
        private Usuario usuario;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_pessoa", nullable = false)
        private Pessoa pessoa;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_agenda")
        private AgendaVacinal agenda;

        private String titulo;

        private String mensagem;

        @Column(name = "data_criacao")
        private LocalDate dataCriacao;

        @Column(name = "data_visualizacao")
        private LocalDate dataVisualizacao;

        private boolean lida;

        private String tipo;
}
