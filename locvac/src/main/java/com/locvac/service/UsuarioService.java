package com.locvac.service;

import com.locvac.dto.auth.AuthResponse;
import com.locvac.dto.usuario.ConfirmarCadastroDTO;
import com.locvac.dto.usuario.IniciarCadastroDTO;
import com.locvac.dto.usuario.ReenviarCodigoDTO;

public interface UsuarioService {

    void iniciarCadastro(IniciarCadastroDTO dto);

    AuthResponse confirmarCadastro(ConfirmarCadastroDTO dto);

    void reenviarCodigo(ReenviarCodigoDTO dto);

}
