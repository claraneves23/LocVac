package com.locvac.service;

import com.locvac.dto.auth.*;
import com.locvac.model.core.Usuario;
import com.locvac.repository.UsuarioRepository;
import dev.samstevens.totp.code.CodeVerifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CodeVerifier codeVerifier;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RefreshTokenService refreshTokenService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            CodeVerifier codeVerifier
    ) {
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.codeVerifier = codeVerifier;
    }

    // -------------------------
    // Login
    // -------------------------

    @Transactional
    public Object login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        // Verifica bloqueio por tentativas falhas
        if (usuario.getBloqueadoAte() != null &&
            usuario.getBloqueadoAte().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Conta bloqueada. Tente novamente mais tarde.");
        }

        // Verifica senha
        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            registrarTentativaFalha(usuario);
            throw new RuntimeException("Credenciais inválidas");
        }

        // Login bem-sucedido — resetar tentativas
        usuario.setTentativasFalhas(0);
        usuario.setBloqueadoAte(null);
        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        TokenData tokenData = new TokenData(usuario.getId(), usuario.getEmail());

        // Se MFA ativo, retorna token temporário
        if (usuario.isMfaEnabled()) {
            String mfaToken = jwtService.gerarMfaToken(tokenData);
            return new MfaResponse(mfaToken, "Digite o código do autenticador.");
        }

        // Se MFA inativo, retorna tokens de acesso
        return gerarAuthResponse(usuario, tokenData);
    }

    // -------------------------
    // Verificação MFA
    // -------------------------

    public AuthResponse verificarMfa(MfaVerifyRequest request) {
        String mfaToken = request.mfaToken();

        if (!jwtService.isTokenValido(mfaToken) ||
            !jwtService.isTokenDoTipo(mfaToken, "mfa")) {
            throw new RuntimeException("Token MFA inválido ou expirado.");
        }

        TokenData tokenData = jwtService.extrairDados(mfaToken);

        Usuario usuario = usuarioRepository.findById(tokenData.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (!codeVerifier.isValidCode(usuario.getMfaSecret(), request.codigo())) {
            throw new RuntimeException("Código MFA inválido.");
        }

        return gerarAuthResponse(usuario, tokenData);
    }

    // -------------------------
    // Refresh
    // -------------------------

    public AuthResponse refresh(RefreshRequest request) {
        return refreshTokenService.validar(request.refreshToken())
                .map(refreshToken -> {
                    Usuario usuario = refreshToken.getUsuario();
                    TokenData tokenData = new TokenData(usuario.getId(), usuario.getEmail());
                    return gerarAuthResponse(usuario, tokenData);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token inválido ou expirado."));
    }

    // -------------------------
    // Logout
    // -------------------------

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenService.revogar(request.refreshToken());
    }

    @Transactional
    public void logoutTodos(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        refreshTokenService.revogarTodos(usuario);
    }

    // -------------------------
    // Interno
    // -------------------------

    private AuthResponse gerarAuthResponse(Usuario usuario, TokenData tokenData) {
        String accessToken = jwtService.gerarAccessToken(tokenData);
        String refreshToken = refreshTokenService.criarRefreshToken(usuario);
        return new AuthResponse(accessToken, refreshToken, usuario.getNome());
    }

    private void registrarTentativaFalha(Usuario usuario) {
        int tentativas = usuario.getTentativasFalhas() + 1;
        usuario.setTentativasFalhas(tentativas);

        if (tentativas >= 5) {
            usuario.setBloqueadoAte(LocalDateTime.now().plusMinutes(15));
        }

        usuarioRepository.save(usuario);
    }
}