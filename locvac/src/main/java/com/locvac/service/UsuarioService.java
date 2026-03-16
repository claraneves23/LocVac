package com.locvac.service;

import com.locvac.dto.usuario.UsuarioCadastroDTO;
import com.locvac.model.core.Usuario;
import com.locvac.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void cadastrar(UsuarioCadastroDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Email já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        usuario.setTelefone(dto.telefone());

        usuarioRepository.save(usuario);
    }
}