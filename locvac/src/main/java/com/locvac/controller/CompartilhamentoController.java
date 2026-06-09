package com.locvac.controller;

import com.locvac.dto.compartilhamento.AcessoResponseDTO;
import com.locvac.dto.compartilhamento.ConvitePreviewDTO;
import com.locvac.dto.compartilhamento.ConviteResponseDTO;
import com.locvac.dto.compartilhamento.CriarConviteRequestDTO;
import com.locvac.service.CompartilhamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compartilhamento")
public class CompartilhamentoController {

    private final CompartilhamentoService service;

    public CompartilhamentoController(CompartilhamentoService service) {
        this.service = service;
    }

    @PostMapping("/convites")
    public ResponseEntity<ConviteResponseDTO> criar(@RequestBody @Valid CriarConviteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarConvite(dto));
    }

    @GetMapping("/convites/{token}")
    public ResponseEntity<ConvitePreviewDTO> preview(@PathVariable String token) {
        return ResponseEntity.ok(service.previewConvite(token));
    }

    @PostMapping("/convites/{token}/aceitar")
    public ResponseEntity<Void> aceitar(@PathVariable String token) {
        service.aceitarConvite(token);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/convites/{token}")
    public ResponseEntity<Void> cancelar(@PathVariable String token) {
        service.cancelarConvite(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pessoa/{idPessoa}/acessos")
    public ResponseEntity<List<AcessoResponseDTO>> listarAcessos(@PathVariable Long idPessoa) {
        return ResponseEntity.ok(service.listarAcessos(idPessoa));
    }

    @DeleteMapping("/acessos/{idUsuarioPessoa}")
    public ResponseEntity<Void> revogar(@PathVariable Long idUsuarioPessoa) {
        service.revogarAcesso(idUsuarioPessoa);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/pessoa/{idPessoa}/meu-acesso")
    public ResponseEntity<Void> removerMeuAcesso(@PathVariable Long idPessoa) {
        service.removerMeuAcesso(idPessoa);
        return ResponseEntity.noContent().build();
    }
}
