package com.locvac.model.associacao;

import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "usuario_pessoa")
public class UsuarioPessoa {

    @Id
    @Column(name = "id_usuario_pessoa")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pessoa", nullable = false)
    private Pessoa pessoa;

    @Column(name = "tipo_vinculo")
    private String tipoVinculo;

    @Column(name = "pode_visualizar")
    private boolean podeVisualizar;

    @Column(name = "pode_editar")
    private boolean podeEditar;

    @Column(name = "data_vinculo")
    private LocalDate dataVinculo;
}