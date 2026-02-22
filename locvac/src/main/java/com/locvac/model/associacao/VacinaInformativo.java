package com.locvac.model.associacao;

import com.locvac.model.core.Vacina;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "vacina_informativo")
public class VacinaInformativo {
        @Id
        @Column(name = "id_informativo")
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_vacina", nullable = false)
        private Vacina vacina;

        @Column(name = "versao", nullable = false)
        private Integer versao;

        @Column(name = "data_publicacao", nullable = false)
        private LocalDate dataPublicacao;

        @Column(name = "orgao_emissor")
        private String orgaoEmissor;

        @Column(name = "fonte_referencia")
        private String fonteReferencia;

        @Column(name = "ativa", nullable = false)
        private boolean ativa;

        @OneToMany(mappedBy = "informativo", fetch = FetchType.LAZY)
        private List<VacinaSecaoInformativa> secoes;

}
