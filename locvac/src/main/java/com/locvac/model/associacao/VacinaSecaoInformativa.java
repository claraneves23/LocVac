package com.locvac.model.associacao;

import jakarta.persistence.*;

@Entity
@Table(name = "vacina_secao_informativa")
public class VacinaSecaoInformativa {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_secao")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_informativo", nullable = false)
        private VacinaInformativo informativo;

        @Column(name = "titulo_secao")
        private String tituloSecao;

        @Column(name = "conteudo")
        private String conteudo;

        @Column(name = "ordem_exibicao")
        private Integer ordemExibicao;

        public void setInformativo(VacinaInformativo informativo) {
                this.informativo = informativo;
        }

        public void setTituloSecao(String tituloSecao) {
                this.tituloSecao = tituloSecao;
        }

        public void setConteudo(String conteudo) {
                this.conteudo = conteudo;
        }

        public void setOrdemExibicao(Integer ordemExibicao) {
                this.ordemExibicao = ordemExibicao;
        }

        public String getId() {
                return id;
        }

        public VacinaInformativo getInformativo() {
                return informativo;
        }

        public String getTituloSecao() {
                return tituloSecao;
        }

        public String getConteudo() {
                return conteudo;
        }

        public Integer getOrdemExibicao() {
                return ordemExibicao;
        }
}
