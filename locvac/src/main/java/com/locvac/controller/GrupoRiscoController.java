package com.locvac.controller;

import com.locvac.dto.grupoRisco.GrupoRiscoRequestDTO;
import com.locvac.dto.grupoRisco.GrupoRiscoResponseDTO;
import com.locvac.service.GrupoRiscoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grupos-risco")
public class GrupoRiscoController {

    private final GrupoRiscoService service;

    public GrupoRiscoController(GrupoRiscoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GrupoRiscoResponseDTO> criar(@RequestBody @Valid GrupoRiscoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @GetMapping
    public List<GrupoRiscoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public GrupoRiscoResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public GrupoRiscoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid GrupoRiscoRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
