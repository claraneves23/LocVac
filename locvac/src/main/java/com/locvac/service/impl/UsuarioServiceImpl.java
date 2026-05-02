package com.locvac.service.impl;

import com.locvac.dto.auth.AuthResponse;
import com.locvac.dto.usuario.ConfirmarCadastroDTO;
import com.locvac.dto.usuario.IniciarCadastroDTO;
import com.locvac.dto.usuario.RedefinirSenhaDTO;
import com.locvac.dto.usuario.ReenviarCodigoDTO;
import com.locvac.dto.usuario.SolicitarRecuperacaoSenhaDTO;
import com.locvac.model.core.EmailVerificacao;
import com.locvac.model.core.RecuperacaoSenha;
import com.locvac.model.core.Usuario;
import com.locvac.repository.EmailVerificacaoRepository;
import com.locvac.repository.RecuperacaoSenhaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.service.AuthService;
import com.locvac.service.EmailService;
import com.locvac.service.UsuarioService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private static final SecureRandom RNG = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final EmailVerificacaoRepository emailVerificacaoRepository;
    private final RecuperacaoSenhaRepository recuperacaoSenhaRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthService authService;
    private final int expiracaoMinutos;
    private final int maxTentativas;
    private final int intervaloReenvioSegundos;

    public UsuarioServiceImpl(
            UsuarioRepository usuarioRepository,
            EmailVerificacaoRepository emailVerificacaoRepository,
            RecuperacaoSenhaRepository recuperacaoSenhaRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            AuthService authService,
            @Value("${cadastro.codigo.expiracao-minutos:10}") int expiracaoMinutos,
            @Value("${cadastro.codigo.max-tentativas:5}") int maxTentativas,
            @Value("${cadastro.reenvio.intervalo-segundos:60}") int intervaloReenvioSegundos
    ) {
        this.usuarioRepository = usuarioRepository;
        this.emailVerificacaoRepository = emailVerificacaoRepository;
        this.recuperacaoSenhaRepository = recuperacaoSenhaRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.authService = authService;
        this.expiracaoMinutos = expiracaoMinutos;
        this.maxTentativas = maxTentativas;
        this.intervaloReenvioSegundos = intervaloReenvioSegundos;
    }

    @Override
    public void iniciarCadastro(IniciarCadastroDTO dto) {
        String email = normalizar(dto.email());

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado.");
        }

        String codigo = gerarCodigo();
        LocalDateTime agora = LocalDateTime.now();

        EmailVerificacao verificacao = emailVerificacaoRepository.findByEmail(email)
                .orElseGet(EmailVerificacao::new);

        verificacao.setEmail(email);
        verificacao.setSenhaHash(passwordEncoder.encode(dto.senha()));
        verificacao.setCodigoHash(passwordEncoder.encode(codigo));
        verificacao.setTentativas(0);
        verificacao.setExpiraEm(agora.plusMinutes(expiracaoMinutos));
        verificacao.setCriadoEm(agora);
        verificacao.setUltimoEnvioEm(agora);

        emailVerificacaoRepository.save(verificacao);
        emailService.enviarCodigoVerificacao(email, codigo);
    }

    @Override
    public AuthResponse confirmarCadastro(ConfirmarCadastroDTO dto) {
        String email = normalizar(dto.email());

        EmailVerificacao verificacao = emailVerificacaoRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.GONE, "Cadastro não iniciado ou já confirmado."));

        if (verificacao.getExpiraEm().isBefore(LocalDateTime.now())) {
            emailVerificacaoRepository.delete(verificacao);
            throw new ResponseStatusException(HttpStatus.GONE, "Código expirado. Solicite um novo.");
        }

        if (verificacao.getTentativas() >= maxTentativas) {
            emailVerificacaoRepository.delete(verificacao);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Tentativas excedidas. Solicite um novo código.");
        }

        if (!passwordEncoder.matches(dto.codigo(), verificacao.getCodigoHash())) {
            verificacao.setTentativas(verificacao.getTentativas() + 1);
            emailVerificacaoRepository.save(verificacao);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Código inválido.");
        }

        if (usuarioRepository.existsByEmail(email)) {
            emailVerificacaoRepository.delete(verificacao);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(email);
        usuario.setEmail(email);
        usuario.setSenhaHash(verificacao.getSenhaHash());
        usuario = usuarioRepository.save(usuario);

        emailVerificacaoRepository.delete(verificacao);

        return authService.autenticarUsuario(usuario);
    }

    @Override
    public void reenviarCodigo(ReenviarCodigoDTO dto) {
        String email = normalizar(dto.email());

        EmailVerificacao verificacao = emailVerificacaoRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inicie o cadastro primeiro."));

        LocalDateTime agora = LocalDateTime.now();
        long segundosDesdeUltimoEnvio = java.time.Duration.between(verificacao.getUltimoEnvioEm(), agora).getSeconds();
        if (segundosDesdeUltimoEnvio < intervaloReenvioSegundos) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Aguarde " + (intervaloReenvioSegundos - segundosDesdeUltimoEnvio) + "s para reenviar."
            );
        }

        String codigo = gerarCodigo();
        verificacao.setCodigoHash(passwordEncoder.encode(codigo));
        verificacao.setTentativas(0);
        verificacao.setExpiraEm(agora.plusMinutes(expiracaoMinutos));
        verificacao.setUltimoEnvioEm(agora);
        emailVerificacaoRepository.save(verificacao);

        emailService.enviarCodigoVerificacao(email, codigo);
    }

    @Override
    public void solicitarRecuperacaoSenha(SolicitarRecuperacaoSenhaDTO dto) {
        String email = normalizar(dto.email());

        if (!usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email não cadastrado.");
        }

        String codigo = gerarCodigo();
        LocalDateTime agora = LocalDateTime.now();

        RecuperacaoSenha recuperacao = recuperacaoSenhaRepository.findByEmail(email)
                .orElseGet(RecuperacaoSenha::new);

        recuperacao.setEmail(email);
        recuperacao.setCodigoHash(passwordEncoder.encode(codigo));
        recuperacao.setTentativas(0);
        recuperacao.setExpiraEm(agora.plusMinutes(expiracaoMinutos));
        if (recuperacao.getCriadoEm() == null) {
            recuperacao.setCriadoEm(agora);
        }
        recuperacao.setUltimoEnvioEm(agora);

        recuperacaoSenhaRepository.save(recuperacao);
        emailService.enviarCodigoRecuperacaoSenha(email, codigo);
    }

    @Override
    public void reenviarCodigoRecuperacaoSenha(ReenviarCodigoDTO dto) {
        String email = normalizar(dto.email());

        RecuperacaoSenha recuperacao = recuperacaoSenhaRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicite a recuperação primeiro."));

        LocalDateTime agora = LocalDateTime.now();
        long segundosDesdeUltimoEnvio = java.time.Duration.between(recuperacao.getUltimoEnvioEm(), agora).getSeconds();
        if (segundosDesdeUltimoEnvio < intervaloReenvioSegundos) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Aguarde " + (intervaloReenvioSegundos - segundosDesdeUltimoEnvio) + "s para reenviar."
            );
        }

        String codigo = gerarCodigo();
        recuperacao.setCodigoHash(passwordEncoder.encode(codigo));
        recuperacao.setTentativas(0);
        recuperacao.setExpiraEm(agora.plusMinutes(expiracaoMinutos));
        recuperacao.setUltimoEnvioEm(agora);
        recuperacaoSenhaRepository.save(recuperacao);

        emailService.enviarCodigoRecuperacaoSenha(email, codigo);
    }

    @Override
    public AuthResponse redefinirSenha(RedefinirSenhaDTO dto) {
        String email = normalizar(dto.email());

        RecuperacaoSenha recuperacao = recuperacaoSenhaRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.GONE, "Recuperação não solicitada ou já concluída."));

        if (recuperacao.getExpiraEm().isBefore(LocalDateTime.now())) {
            recuperacaoSenhaRepository.delete(recuperacao);
            throw new ResponseStatusException(HttpStatus.GONE, "Código expirado. Solicite um novo.");
        }

        if (recuperacao.getTentativas() >= maxTentativas) {
            recuperacaoSenhaRepository.delete(recuperacao);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Tentativas excedidas. Solicite um novo código.");
        }

        if (!passwordEncoder.matches(dto.codigo(), recuperacao.getCodigoHash())) {
            recuperacao.setTentativas(recuperacao.getTentativas() + 1);
            recuperacaoSenhaRepository.save(recuperacao);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Código inválido.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    recuperacaoSenhaRepository.delete(recuperacao);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Email não cadastrado.");
                });

        usuario.setSenhaHash(passwordEncoder.encode(dto.novaSenha()));
        usuario = usuarioRepository.save(usuario);

        recuperacaoSenhaRepository.delete(recuperacao);
        authService.logoutTodos(usuario.getId());

        return authService.autenticarUsuario(usuario);
    }

    private String gerarCodigo() {
        int n = RNG.nextInt(1_000_000);
        return String.format("%06d", n);
    }

    private String normalizar(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
