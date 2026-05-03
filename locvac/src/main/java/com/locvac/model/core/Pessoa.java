package com.locvac.model.core;

import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.enums.Estado;
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

    @Column(nullable = true, unique = true)
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

    @Column(name = "nome_responsavel")
    private String nomeResponsavel;

    @Column
    private String rua;

    @Column
    private String complemento;

    @Column
    private String municipio;

    @Enumerated(EnumType.STRING)
    @Column
    private Estado estado;

    @Column(nullable = false)
    private  boolean ativo;

    @OneToMany(mappedBy = "pessoa", fetch = FetchType.LAZY)
    private List<UsuarioPessoa> usuarioPessoas;

    public Pessoa(Long id) {
        this.id = id;
    }

    public Pessoa(){}

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

    public void setRua(String rua) { this.rua = rua; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }
    public void setEstado(Estado estado) { this.estado = estado; }

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

    public String getRua() { return rua; }
    public String getComplemento() { return complemento; }
    public String getMunicipio() { return municipio; }
    public Estado getEstado() { return estado; }

    public boolean isAtivo() {
        return ativo;
    }

    public List<UsuarioPessoa> getUsuarioPessoas() {
        return usuarioPessoas;
    }
}
