package com.locvac.service;

import com.locvac.model.core.RefreshToken;
import com.locvac.model.core.Usuario;

import java.util.Optional;

public interface RefreshTokenService {

    String criarRefreshToken(Usuario usuario);

    Optional<RefreshToken> validar(String tokenBruto);

    void revogar(String tokenBruto);

    void revogarTodos(Usuario usuario);

}