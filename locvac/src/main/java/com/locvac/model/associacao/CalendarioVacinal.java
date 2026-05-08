package com.locvac.model.associacao;

import com.locvac.model.core.GrupoRisco;
import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "calendario_vacinal")
public class CalendarioVacinal {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_calendario")
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @Column(name = "faixa_etaria_min_meses", nullable = false)
        private Integer faixaEtariaMinMeses;

        @Column(name = "faixa_etaria_max_meses", nullable = false)
        private Integer faixaEtariaMaxMeses;

        @Column(name = "publico_alvo", length = 200)
        private String publicoAlvo;

        @Column(name = "obrigatoria", nullable = false)
        private boolean obrigatoria;

        @Column(name = "numero_dose", nullable = false, length = 20)
        private String numeroDose;

        @Column(name = "descricao_dose", length = 200)
        private String descricaoDose;

        @Column(name = "ordem_exibicao", length = 20)
        private String ordemExibicao;

        @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(
                name = "calendario_vacinal_grupo_risco",
                joinColumns = @JoinColumn(name = "id_calendario"),
                inverseJoinColumns = @JoinColumn(name = "id_grupo_risco")
        )
        private List<GrupoRisco> gruposRisco = new ArrayList<>();

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

        public Long getId() {
                return id;
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

        public List<GrupoRisco> getGruposRisco() { return gruposRisco; }
        public void setGruposRisco(List<GrupoRisco> gruposRisco) { this.gruposRisco = gruposRisco; }
}
