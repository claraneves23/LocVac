package com.locvac.service;

import com.locvac.dto.auth.TokenData;

public interface JwtService {

    String gerarAccessToken(TokenData dados);

    String gerarMfaToken(TokenData dados);

    boolean isTokenValido(String token);

    boolean isTokenDoTipo(String token, String tipo);

    TokenData extrairDados(String token);

}