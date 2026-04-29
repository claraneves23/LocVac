package com.locvac.model.core;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verificacao")
public class EmailVerificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_email_verificacao")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "codigo_hash", nullable = false)
    private String codigoHash;

    @Column(nullable = false)
    private int tentativas;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "ultimo_envio_em", nullable = false)
    private LocalDateTime ultimoEnvioEm;

    public EmailVerificacao() {}

    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }

    public String getCodigoHash() { return codigoHash; }
    public void setCodigoHash(String codigoHash) { this.codigoHash = codigoHash; }

    public int getTentativas() { return tentativas; }
    public void setTentativas(int tentativas) { this.tentativas = tentativas; }

    public LocalDateTime getExpiraEm() { return expiraEm; }
    public void setExpiraEm(LocalDateTime expiraEm) { this.expiraEm = expiraEm; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public LocalDateTime getUltimoEnvioEm() { return ultimoEnvioEm; }
    public void setUltimoEnvioEm(LocalDateTime ultimoEnvioEm) { this.ultimoEnvioEm = ultimoEnvioEm; }
}
