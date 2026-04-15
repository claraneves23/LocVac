package com.locvac.model.associacao;

import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoVinculo;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "usuario_pessoa")
public class UsuarioPessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_pessoa")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pessoa", nullable = false)
    private Pessoa pessoa;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vinculo", nullable = false)
    private TipoVinculo tipoVinculo;

    @Column(name = "pode_visualizar", nullable = false)
    private boolean podeVisualizar;

    @Column(name = "pode_editar", nullable = false)
    private boolean podeEditar;

    @Column(name = "data_vinculo")
    private LocalDate dataVinculo;
    
    @Column(name = "dsc_parentesco")
    private String dscParentesco;

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    public void setTipoVinculo(TipoVinculo tipoVinculo) {
        this.tipoVinculo = tipoVinculo;
    }

    public void setPodeVisualizar(boolean podeVisualizar) {
        this.podeVisualizar = podeVisualizar;
    }

    public void setPodeEditar(boolean podeEditar) {
        this.podeEditar = podeEditar;
    }

    public void setDataVinculo(LocalDate dataVinculo) {
        this.dataVinculo = dataVinculo;
    }

    public void setDscParentesco(String dscParentesco) {
        this.dscParentesco = dscParentesco;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Pessoa getPessoa() {
        return pessoa;
    }

    public TipoVinculo getTipoVinculo() {
        return tipoVinculo;
    }

    public boolean isPodeVisualizar() {
        return podeVisualizar;
    }

    public boolean isPodeEditar() {
        return podeEditar;
    }

    public LocalDate getDataVinculo() {
        return dataVinculo;
    }

    public String getDscParentesco() {
        return dscParentesco;
    }
}