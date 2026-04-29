package com.locvac.service;

import com.locvac.dto.auth.*;
import com.locvac.model.core.Usuario;

import java.util.UUID;

public interface AuthService {

    Object login(LoginRequest request);

    AuthResponse verificarMfa(MfaVerifyRequest request);

    AuthResponse refresh(RefreshRequest request);

    void logout(RefreshRequest request);

    void logoutTodos(UUID usuarioId);

    AuthResponse autenticarUsuario(Usuario usuario);

}