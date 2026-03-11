package com.locvac.model.core;

import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.enums.Sexo;
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

    @Enumerated(EnumType.STRING)
    @Column(name="sexo_biologico", nullable = false)
    private Sexo sexoBiologico;

    @Column(unique = true)
    private String cns;

    @Column(name = "cep", nullable = false)
    private String cep;

    @Column(name="telefone", nullable = false)
    private String telefone;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "nome_responsavel", nullable = false)
    private String nomeResponsavel;

    @Column(nullable = false)
    private  boolean ativo;

    @OneToMany(mappedBy = "pessoa", fetch = FetchType.LAZY)
    private List<UsuarioPessoa> usuarioPessoas;

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public void setSexoBiologico(Sexo sexoBiologico) {
        this.sexoBiologico = sexoBiologico;
    }

    public void setCns(String cns) {
        this.cns = cns;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public void setNomeResponsavel(String nomeResponsavel) {
        this.nomeResponsavel = nomeResponsavel;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public void setUsuarioPessoas(List<UsuarioPessoa> usuarioPessoas) {
        this.usuarioPessoas = usuarioPessoas;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public String getCpf() {
        return cpf;
    }

    public Sexo getSexoBiologico() {
        return sexoBiologico;
    }

    public String getCns() {
        return cns;
    }

    public String getCep() {
        return cep;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public String getNomeResponsavel() {
        return nomeResponsavel;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public List<UsuarioPessoa> getUsuarioPessoas() {
        return usuarioPessoas;
    }
}
