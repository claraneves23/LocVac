package com.locvac.controller;

import com.locvac.dto.pessoa.PessoaFotoRequestDTO;
import com.locvac.dto.pessoa.PessoaFotoResponseDTO;
import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;
import com.locvac.service.PessoaFotoService;
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
    private final PessoaFotoService fotoService;

    public PessoaController(PessoaService service, PessoaFotoService fotoService) {
        this.service = service;
        this.fotoService = fotoService;
    }

    @PostMapping
    public ResponseEntity<PessoaResponseDTO> cadastrar(@RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @PostMapping("/titular")
    public ResponseEntity<PessoaResponseDTO> cadastrarTitular(@RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrarTitular(dto));
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

    @PutMapping("/{id}")
    public ResponseEntity<PessoaResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<PessoaFotoResponseDTO> salvarFoto(@PathVariable Long id, @RequestBody @Valid PessoaFotoRequestDTO dto) {
        return ResponseEntity.ok(fotoService.salvar(id, dto.dataUrl()));
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<PessoaFotoResponseDTO> obterFoto(@PathVariable Long id) {
        return ResponseEntity.ok(fotoService.obter(id));
    }

    @DeleteMapping("/{id}/foto")
    public ResponseEntity<Void> removerFoto(@PathVariable Long id) {
        fotoService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
