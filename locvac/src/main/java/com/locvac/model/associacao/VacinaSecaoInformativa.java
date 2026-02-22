package com.locvac.model.associacao;

import jakarta.persistence.*;

@Entity
@Table(name = "vacina_secao_informativa")
public class VacinaSecaoInformativa {

        @Id
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
}
