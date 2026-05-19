package com.locvac.service;

import com.locvac.dto.auth.AuthResponse;
import com.locvac.dto.usuario.ConfirmarCadastroDTO;
import com.locvac.dto.usuario.ExcluirContaDTO;
import com.locvac.dto.usuario.IniciarCadastroDTO;
import com.locvac.dto.usuario.RedefinirSenhaDTO;
import com.locvac.dto.usuario.ReenviarCodigoDTO;
import com.locvac.dto.usuario.SolicitarRecuperacaoSenhaDTO;

import java.util.UUID;

public interface UsuarioService {

    void iniciarCadastro(IniciarCadastroDTO dto);

    AuthResponse confirmarCadastro(ConfirmarCadastroDTO dto);

    void reenviarCodigo(ReenviarCodigoDTO dto);

    void solicitarRecuperacaoSenha(SolicitarRecuperacaoSenhaDTO dto);

    void reenviarCodigoRecuperacaoSenha(ReenviarCodigoDTO dto);

    void redefinirSenha(RedefinirSenhaDTO dto);

    void excluirContaAutenticada(UUID usuarioId, ExcluirContaDTO dto);

}
