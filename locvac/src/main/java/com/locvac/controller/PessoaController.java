package com.locvac.controller;

import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;
import com.locvac.service.PessoaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService service;

    public PessoaController(PessoaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PessoaResponseDTO> cadastrar(@RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<PessoaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/perfil")
    public ResponseEntity<PessoaResponseDTO> getPerfil(@RequestParam Long idPessoa) {
        return ResponseEntity.ok(service.getPerfil(idPessoa));
    }

    @GetMapping("/dependentes")
    public ResponseEntity<List<PessoaResponseDTO>> listarDependentes(@RequestParam UUID usuarioId) {
        return ResponseEntity.ok(service.listarDependentes(usuarioId));
    }
}
