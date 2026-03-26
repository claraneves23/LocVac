package com.locvac.service.impl;

import com.locvac.dto.usuario.UsuarioCadastroDTO;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.repository.PessoaRepository;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.service.UsuarioService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PessoaRepository pessoaRepository;
    private final UsuarioPessoaRepository usuarioPessoaRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, PessoaRepository pessoaRepository, UsuarioPessoaRepository usuarioPessoaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.pessoaRepository = pessoaRepository;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
    }

    @Override
    public void cadastrar(UsuarioCadastroDTO dto) {
        System.out.println("DTO recebido no cadastro: " + dto);
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Email já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        usuario.setTelefone(dto.telefone());
        usuarioRepository.save(usuario);

        // Cria Pessoa vinculada com todos os campos obrigatórios
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(dto.nome());
        pessoa.setDataNascimento(LocalDate.parse(dto.dataNascimento()));
        pessoa.setCpf(dto.cpf());
        pessoa.setSexoBiologico(
            dto.sexoBiologico() != null ? com.locvac.model.enums.Sexo.valueOf(dto.sexoBiologico()) : null
        );
        pessoa.setCep(dto.cep());
        pessoa.setTelefone(dto.telefone());
        pessoa.setAtivo(true);
        pessoa.setNomeResponsavel(""); // ou ajuste conforme regra de negócio
        pessoa = pessoaRepository.save(pessoa);

        // Cria associação UsuarioPessoa
        UsuarioPessoa usuarioPessoa = new UsuarioPessoa();
        usuarioPessoa.setUsuario(usuario);
        usuarioPessoa.setPessoa(pessoa);
        usuarioPessoa.setTipoVinculo("titular");
        usuarioPessoa.setPodeVisualizar(true);
        usuarioPessoa.setPodeEditar(true);
        usuarioPessoa.setDataVinculo(LocalDate.now());
        usuarioPessoaRepository.save(usuarioPessoa);
    }
}