package com.locvac.model.core;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "pessoa_foto")
public class PessoaFoto {

    @Id
    @Column(name = "id_pessoa")
    private Long pessoaId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_pessoa")
    private Pessoa pessoa;

    @Column(name = "bytes", nullable = false, columnDefinition = "bytea")
    private byte[] bytes;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    public PessoaFoto() {}

    public Long getPessoaId() { return pessoaId; }
    public void setPessoaId(Long pessoaId) { this.pessoaId = pessoaId; }

    public Pessoa getPessoa() { return pessoa; }
    public void setPessoa(Pessoa pessoa) { this.pessoa = pessoa; }

    public byte[] getBytes() { return bytes; }
    public void setBytes(byte[] bytes) { this.bytes = bytes; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
