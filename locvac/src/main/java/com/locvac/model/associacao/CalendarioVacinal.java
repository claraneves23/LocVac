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

}
