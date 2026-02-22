package com.locvac.model.core;

import com.locvac.model.associacao.UsuarioPessoa;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pessoa")
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pessoa")
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, unique = true)
    private String cpf;

    @Column(unique = true)
    private String cns;

    @Column(name = "nome_mae")
    private String nomeMae;

    @Column(nullable = false)
    private  boolean ativo;

    @OneToMany(mappedBy = "pessoa", fetch = FetchType.LAZY)
    private List<UsuarioPessoa> usuarioPessoas;
}
