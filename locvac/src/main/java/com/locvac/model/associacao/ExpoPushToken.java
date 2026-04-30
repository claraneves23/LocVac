package com.locvac.model.associacao;

import com.locvac.model.core.Usuario;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "expo_push_token",
        uniqueConstraints = @UniqueConstraint(columnNames = "token")
)
public class ExpoPushToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "token", nullable = false, length = 512)
    private String token;

    @Column(name = "plataforma", length = 32)
    private String plataforma;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public String getToken() { return token; }
    public String getPlataforma() { return plataforma; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setToken(String token) { this.token = token; }
    public void setPlataforma(String plataforma) { this.plataforma = plataforma; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
