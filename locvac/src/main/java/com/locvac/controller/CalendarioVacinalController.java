package com.locvac.controller;

import com.locvac.dto.calendarioVacinal.CalendarioVacinalRequestDTO;
import com.locvac.dto.calendarioVacinal.CalendarioVacinalResponseDTO;
import com.locvac.service.CalendarioVacinalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calendarios-vacinais")
public class CalendarioVacinalController {

    private final CalendarioVacinalService service;

    public CalendarioVacinalController(CalendarioVacinalService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CalendarioVacinalResponseDTO> criar(@RequestBody @Valid CalendarioVacinalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @GetMapping
    public List<CalendarioVacinalResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CalendarioVacinalResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public CalendarioVacinalResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid CalendarioVacinalRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
