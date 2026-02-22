package com.locvac.model.core;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "campanha")
public class Campanha {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_campanha")
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "doenca_alvo")
    private String doencaAlvo;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "publico_alvo")
    private String publicoAlvo;

    @Column(nullable = false)
    private boolean ativa;
}
