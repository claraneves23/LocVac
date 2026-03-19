package com.locvac.model.associacao;

import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoNotificacao;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "notificacao")
public class Notificacao {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
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

        @Column(nullable = false)
        private String titulo;

        @Column(nullable = false)
        private String mensagem;

        @Column(name = "data_criacao", nullable = false)
        private LocalDate dataCriacao;

        @Column(name = "data_visualizacao")
        private LocalDate dataVisualizacao;

        private boolean lida;

        @Enumerated(EnumType.STRING)
        @Column(name= "tipo_notificacao", nullable = false)
        private TipoNotificacao tipoNotificacao;

        public void setUsuario(Usuario usuario) {
                this.usuario = usuario;
        }

        public void setPessoa(Pessoa pessoa) {
                this.pessoa = pessoa;
        }

        public void setAgenda(AgendaVacinal agenda) {
                this.agenda = agenda;
        }

        public void setTitulo(String titulo) {
                this.titulo = titulo;
        }

        public void setMensagem(String mensagem) {
                this.mensagem = mensagem;
        }

        public void setDataCriacao(LocalDate dataCriacao) {
                this.dataCriacao = dataCriacao;
        }

        public void setDataVisualizacao(LocalDate dataVisualizacao) {
                this.dataVisualizacao = dataVisualizacao;
        }

        public void setLida(boolean lida) {
                this.lida = lida;
        }

        public void setTipoNotificacao(TipoNotificacao tipoNotificacao) {
                this.tipoNotificacao = tipoNotificacao;
        }

        public Usuario getUsuario() {
                return usuario;
        }

        public Pessoa getPessoa() {
                return pessoa;
        }

        public AgendaVacinal getAgenda() {
                return agenda;
        }

        public String getTitulo() {
                return titulo;
        }

        public String getMensagem() {
                return mensagem;
        }

        public LocalDate getDataCriacao() {
                return dataCriacao;
        }

        public LocalDate getDataVisualizacao() {
                return dataVisualizacao;
        }

        public boolean isLida() {
                return lida;
        }

        public TipoNotificacao getTipoNotificacao() {
                return tipoNotificacao;
        }
}
