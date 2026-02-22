package com.locvac.model.core;

import jakarta.persistence.*;

@Entity
@Table(name = "unidade_saude")
public class UnidadeSaude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidade_saude")
    private Long id;

    @Column(nullable = false)
    private String nome;
    private String endereco;

    @Column(nullable = false)
    private String municipio;

    @Column(nullable = false)
    private String estado;
    private String telefone;
    private String email;

    @Column(nullable = false, unique = true)
    private String cnes;
    private String descricao;

    @Column(nullable = false)
    private boolean ativa;

}
