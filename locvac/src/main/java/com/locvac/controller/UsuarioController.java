package com.locvac.controller;

import com.locvac.dto.auth.AuthResponse;
import com.locvac.dto.usuario.ConfirmarCadastroDTO;
import com.locvac.dto.usuario.IniciarCadastroDTO;
import com.locvac.dto.usuario.ReenviarCodigoDTO;
import com.locvac.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/cadastro/iniciar")
    public ResponseEntity<Void> iniciar(@RequestBody @Valid IniciarCadastroDTO dto) {
        usuarioService.iniciarCadastro(dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PostMapping("/cadastro/confirmar")
    public ResponseEntity<AuthResponse> confirmar(@RequestBody @Valid ConfirmarCadastroDTO dto) {
        return ResponseEntity.ok(usuarioService.confirmarCadastro(dto));
    }

    @PostMapping("/cadastro/reenviar")
    public ResponseEntity<Void> reenviar(@RequestBody @Valid ReenviarCodigoDTO dto) {
        usuarioService.reenviarCodigo(dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
}
