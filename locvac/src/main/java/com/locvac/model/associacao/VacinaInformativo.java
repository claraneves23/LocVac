package com.locvac.model.associacao;

import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "vacina_informativo")
public class VacinaInformativo {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_informativo")
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @Column(name = "versao", nullable = false)
        private Integer versao;

        @Column(name = "data_publicacao", nullable = false)
        private LocalDate dataPublicacao;

        @Column(name = "orgao_emissor", nullable = false, length = 100)
        private String orgaoEmissor;

        @Column(name = "fonte_referencia", nullable = false, length = 500)
        private String fonteReferencia;

        @OneToMany(mappedBy = "informativo", fetch = FetchType.LAZY)
        private List<VacinaSecaoInformativa> secoes;

        public void setVacina(Vacina vacina) {
                this.vacina = vacina;
        }

        public void setVersao(Integer versao) {
                this.versao = versao;
        }

        public void setDataPublicacao(LocalDate dataPublicacao) {
                this.dataPublicacao = dataPublicacao;
        }

        public void setOrgaoEmissor(String orgaoEmissor) {
                this.orgaoEmissor = orgaoEmissor;
        }

        public void setFonteReferencia(String fonteReferencia) {
                this.fonteReferencia = fonteReferencia;
        }

        public void setSecoes(List<VacinaSecaoInformativa> secoes) {
                this.secoes = secoes;
        }

        public Long getId() {
                return id;
        }

        public Vacina getVacina() {
                return vacina;
        }

        public Integer getVersao() {
                return versao;
        }

        public LocalDate getDataPublicacao() {
                return dataPublicacao;
        }

        public String getOrgaoEmissor() {
                return orgaoEmissor;
        }

        public String getFonteReferencia() {
                return fonteReferencia;
        }

        public List<VacinaSecaoInformativa> getSecoes() {
                return secoes;
        }
}
