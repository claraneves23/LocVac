package com.locvac.model.associacao;

import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.UnidadeSaude;
import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "dose_aplicada")
public class DoseAplicada {

        @Id
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

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_campanha")
        private Campanha campanha;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_unidade", nullable = false)
        private UnidadeSaude unidade;

        @Column(name = "dose_numero")
        private Integer doseNumero;

        @Column(name = "data_aplicacao")
        private LocalDate dataAplicacao;

        @Column(name = "lote")
        private String lote;

        @Column(name = "observacao")
        private String observacao;

        @Column(name = "criada_por")
        private String criadaPor;

        @Column(name = "data_registro")
        private LocalDate dataRegistro;

}
