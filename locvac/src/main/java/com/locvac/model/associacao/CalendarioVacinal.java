package com.locvac.model.associacao;

import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

@Entity
@Table(name = "calendario_vacinal")
public class CalendarioVacinal {

        @Id
        @Column(name = "id_calendario")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @Column(name = "faixa_etaria_min_meses", nullable = false)
        private Integer faixaEtariaMinMeses;

        @Column(name = "faixa_etaria_max_meses", nullable = false)
        private Integer faixaEtariaMaxMeses;

        @Column(name = "publico_alvo")
        private String publicoAlvo;

        @Column(name = "obrigatoria", nullable = false)
        private boolean obrigatoria;

        @Column(name = "numero_dose", nullable = false)
        private String numeroDose;

        @Column(name = "descricao_dose")
        private String descricaoDose;

        @Column(name = "ordem_exibicao")
        private String ordemExibicao;

        public void setVacina(Vacina vacina) {
                this.vacina = vacina;
        }

        public void setFaixaEtariaMinMeses(Integer faixaEtariaMinMeses) {
                this.faixaEtariaMinMeses = faixaEtariaMinMeses;
        }

        public void setFaixaEtariaMaxMeses(Integer faixaEtariaMaxMeses) {
                this.faixaEtariaMaxMeses = faixaEtariaMaxMeses;
        }

        public void setPublicoAlvo(String publicoAlvo) {
                this.publicoAlvo = publicoAlvo;
        }

        public void setObrigatoria(boolean obrigatoria) {
                this.obrigatoria = obrigatoria;
        }

        public void setNumeroDose(String numeroDose) {
                this.numeroDose = numeroDose;
        }

        public void setDescricaoDose(String descricaoDose) {
                this.descricaoDose = descricaoDose;
        }

        public void setOrdemExibicao(String ordemExibicao) {
                this.ordemExibicao = ordemExibicao;
        }

        public Vacina getVacina() {
                return vacina;
        }

        public Integer getFaixaEtariaMinMeses() {
                return faixaEtariaMinMeses;
        }

        public Integer getFaixaEtariaMaxMeses() {
                return faixaEtariaMaxMeses;
        }

        public String getPublicoAlvo() {
                return publicoAlvo;
        }

        public boolean isObrigatoria() {
                return obrigatoria;
        }

        public String getNumeroDose() {
                return numeroDose;
        }

        public String getDescricaoDose() {
                return descricaoDose;
        }

        public String getOrdemExibicao() {
                return ordemExibicao;
        }
}
