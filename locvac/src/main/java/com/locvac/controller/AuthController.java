package com.locvac.controller;

import com.locvac.dto.auth.*;
import com.locvac.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Object resposta = authService.login(request);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<AuthResponse> verificarMfa(@RequestBody MfaVerifyRequest request) {
        AuthResponse resposta = authService.verificarMfa(request);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        AuthResponse resposta = authService.refresh(request);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout/todos")
    public ResponseEntity<Void> logoutTodos() {
        TokenData dados = (TokenData) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        authService.logoutTodos(dados.usuarioId());
        return ResponseEntity.noContent().build();
    }

}