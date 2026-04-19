package com.locvac.controller;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaRequestDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;
import com.locvac.service.VacinaSecaoInformativaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacina-secoes")
public class VacinaSecaoInformativaController {

    private final VacinaSecaoInformativaService service;

    public VacinaSecaoInformativaController(VacinaSecaoInformativaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VacinaSecaoInformativaResponseDTO> create(@RequestBody VacinaSecaoInformativaRequestDTO dto) {
        VacinaSecaoInformativaResponseDTO response = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacinaSecaoInformativaResponseDTO> update(@PathVariable Long id, @RequestBody VacinaSecaoInformativaRequestDTO dto) {
        VacinaSecaoInformativaResponseDTO response = service.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacinaSecaoInformativaResponseDTO> findById(@PathVariable Long id) {
        VacinaSecaoInformativaResponseDTO response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/informativo/{idInformativo}")
    public ResponseEntity<List<VacinaSecaoInformativaResponseDTO>> findByInformativo(@PathVariable Long idInformativo) {
        List<VacinaSecaoInformativaResponseDTO> response = service.findByInformativo(idInformativo);
        return ResponseEntity.ok(response);
    }
}