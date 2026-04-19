package com.locvac.controller;

import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralRequestDTO;
import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralResponseDTO;
import com.locvac.model.enums.Severidade;
import com.locvac.service.VacinaEfeitoColateralService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacina-efeitos")
public class VacinaEfeitoColateralController {

    private final VacinaEfeitoColateralService service;

    public VacinaEfeitoColateralController(VacinaEfeitoColateralService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VacinaEfeitoColateralResponseDTO> create(@RequestBody VacinaEfeitoColateralRequestDTO dto) {
        VacinaEfeitoColateralResponseDTO response = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacinaEfeitoColateralResponseDTO> update(@PathVariable Long id, @RequestBody VacinaEfeitoColateralRequestDTO dto) {
        VacinaEfeitoColateralResponseDTO response = service.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacinaEfeitoColateralResponseDTO> findById(@PathVariable Long id) {
        VacinaEfeitoColateralResponseDTO response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vacina/{idVacina}")
    public ResponseEntity<List<VacinaEfeitoColateralResponseDTO>> findByVacina(@PathVariable Long idVacina) {
        List<VacinaEfeitoColateralResponseDTO> response = service.findByVacina(idVacina);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/severidade/{severidade}")
    public ResponseEntity<List<VacinaEfeitoColateralResponseDTO>> findBySeveridade(@PathVariable Severidade severidade) {
        List<VacinaEfeitoColateralResponseDTO> response = service.findBySeveridade(severidade);
        return ResponseEntity.ok(response);
    }
}