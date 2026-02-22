package com.locvac.model.core;

import jakarta.persistence.*;

@Entity
@Table(name = "vacina")
public class Vacina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacina")
    private Long id;

    @Column(nullable = false)
    private String nome;
    private String fabricante;

    @Column(nullable = false)
    private String tipo;

    @Column(name = "via_administracao")
    private String viaAdministracao;

    @Column(name = "codigo_pni", unique = true)
    private String codigoPNI;

    @Column(nullable = false)
    private boolean ativa;

}
