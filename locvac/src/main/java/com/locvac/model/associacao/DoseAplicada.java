package com.locvac.model.associacao;

import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Vacina;
import com.locvac.model.enums.Fabricante;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "dose_aplicada")
public class DoseAplicada {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_dose")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_pessoa", nullable = false)
        private Pessoa pessoa;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_categoria")
        private CategoriaVacina categoria;

        @Column(name = "dose_numero", nullable = false)
        private Integer doseNumero;

        @Column(name = "nome_profissional")
        private String nomeProfissional;

        @Column(name = "registro_profissional")
        private String registroProfissional;

        @Column(name = "data_aplicacao", nullable = false)
        private LocalDate dataAplicacao;

        @Column(name = "lote")
        private String lote;

        @Column(name = "observacao")
        private String observacao;

        @Enumerated(EnumType.STRING)
        @Column(name = "fabricante")
        private Fabricante fabricante;

        @Column(name = "data_registro")
        private LocalDate dataRegistro;

        @Column(name = "unidade_saude")
        private String unidadeSaude;

        public void setPessoa(Pessoa pessoa) {
                this.pessoa = pessoa;
        }

        public void setVacina(Vacina vacina) {
                this.vacina = vacina;
        }

        public void setCategoria(CategoriaVacina categoria) {
                this.categoria = categoria;
        }

        public void setDoseNumero(Integer doseNumero) {
                this.doseNumero = doseNumero;
        }

        public void setNomeProfissional(String nomeProfissional) {
                this.nomeProfissional = nomeProfissional;
        }

        public void setRegistroProfissional(String registroProfissional) {
                this.registroProfissional = registroProfissional;
        }

        public void setDataAplicacao(LocalDate dataAplicacao) {
                this.dataAplicacao = dataAplicacao;
        }

        public void setLote(String lote) {
                this.lote = lote;
        }

        public void setObservacao(String observacao) {
                this.observacao = observacao;
        }

        public void setFabricante(Fabricante fabricante) {
                this.fabricante = fabricante;
        }

        public void setDataRegistro(LocalDate dataRegistro) {
                this.dataRegistro = dataRegistro;
        }

        public void setUnidadeSaude(String unidadeSaude) {
                unidadeSaude = unidadeSaude;
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

        public CategoriaVacina getCategoria() {
                return categoria;
        }

        public Integer getDoseNumero() {
                return doseNumero;
        }

        public String getNomeProfissional() {
                return nomeProfissional;
        }

        public String getRegistroProfissional() {
                return registroProfissional;
        }

        public LocalDate getDataAplicacao() {
                return dataAplicacao;
        }

        public String getLote() {
                return lote;
        }

        public String getObservacao() {
                return observacao;
        }

        public Fabricante getFabricante() {
                return fabricante;
        }

        public LocalDate getDataRegistro() {
                return dataRegistro;
        }

        public String getUnidadeSaude() {
                return unidadeSaude;
        }
}
