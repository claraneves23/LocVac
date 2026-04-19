package com.locvac.controller;

import com.locvac.dto.vacinaInformativo.VacinaInformativoRequestDTO;
import com.locvac.dto.vacinaInformativo.VacinaInformativoResponseDTO;
import com.locvac.service.VacinaInformativoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacina-informativos")
public class VacinaInformativoController {

    private final VacinaInformativoService service;

    public VacinaInformativoController(VacinaInformativoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VacinaInformativoResponseDTO> create(@RequestBody VacinaInformativoRequestDTO dto) {
        VacinaInformativoResponseDTO response = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacinaInformativoResponseDTO> update(@PathVariable Long id, @RequestBody VacinaInformativoRequestDTO dto) {
        VacinaInformativoResponseDTO response = service.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacinaInformativoResponseDTO> findById(@PathVariable Long id) {
        VacinaInformativoResponseDTO response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<VacinaInformativoResponseDTO>> findAll() {
        List<VacinaInformativoResponseDTO> response = service.findAll();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vacina/{idVacina}")
    public ResponseEntity<List<VacinaInformativoResponseDTO>> findByVacina(@PathVariable Long idVacina) {
        List<VacinaInformativoResponseDTO> response = service.findByVacina(idVacina);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vacina/{idVacina}/ativo")
    public ResponseEntity<VacinaInformativoResponseDTO> findAtivoByVacina(@PathVariable Long idVacina) {
        VacinaInformativoResponseDTO response = service.findAtivoByVacina(idVacina);
        return ResponseEntity.ok(response);
    }
}