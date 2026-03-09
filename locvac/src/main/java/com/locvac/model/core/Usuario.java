package com.locvac.model.core;

import com.locvac.model.associacao.UsuarioPessoa;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    private String telefone;

    @Column(nullable = false)
    private boolean ativo;

    @Column(name = "data_criacao", nullable = false)
    private LocalDate dataCriacao;

    private LocalDate ultimoLogin;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<UsuarioPessoa> usuarioPessoas;

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public void setUltimoLogin(LocalDate ultimoLogin) {
        this.ultimoLogin = ultimoLogin;
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

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public String getTelefone() {
        return telefone;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public LocalDate getUltimoLogin() {
        return ultimoLogin;
    }

    public List<UsuarioPessoa> getUsuarioPessoas() {
        return usuarioPessoas;
    }
}
