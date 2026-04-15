package com.locvac.controller;

import com.locvac.dto.usuarioPessoa.UsuarioPessoaRequestDTO;
import com.locvac.dto.usuarioPessoa.UsuarioPessoaResponseDTO;
import com.locvac.service.UsuarioPessoaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarioPessoa")
public class UsuarioPessoaController {
    private final UsuarioPessoaService usuarioPessoaService;

    public UsuarioPessoaController(UsuarioPessoaService usuarioPessoaService) {
        this.usuarioPessoaService = usuarioPessoaService;
    }

    @PostMapping("/novaVinculacao")
    public ResponseEntity<UsuarioPessoaResponseDTO> cadastrar(@RequestBody UsuarioPessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioPessoaService.cadastrar(dto));
    }


    @GetMapping("/por-pessoa")
    public ResponseEntity<List<UsuarioPessoaResponseDTO>> buscarPorPessoa(@RequestParam Long idPessoa) {
        return ResponseEntity.ok(usuarioPessoaService.buscarPorPessoa(idPessoa));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioPessoaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioPessoaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioPessoaResponseDTO> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(usuarioPessoaService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable String id) {
        usuarioPessoaService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
