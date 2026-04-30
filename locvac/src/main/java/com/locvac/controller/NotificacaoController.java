package com.locvac.controller;

import com.locvac.dto.auth.TokenData;
import com.locvac.dto.notificacao.NotificacaoResponseDTO;
import com.locvac.dto.notificacao.RegistrarTokenDTO;
import com.locvac.service.NotificacaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public ResponseEntity<List<NotificacaoResponseDTO>> listar() {
        return ResponseEntity.ok(notificacaoService.listar(usuarioId()));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        notificacaoService.marcarComoLida(id, usuarioId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/push-tokens")
    public ResponseEntity<Void> registrarToken(@RequestBody @Valid RegistrarTokenDTO dto) {
        notificacaoService.registrarToken(usuarioId(), dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/push-tokens/{token}")
    public ResponseEntity<Void> removerToken(@PathVariable String token) {
        notificacaoService.removerToken(token);
        return ResponseEntity.noContent().build();
    }

    private UUID usuarioId() {
        TokenData dados = (TokenData) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return dados.usuarioId();
    }
}
