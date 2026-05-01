package com.locvac.controller;

import com.locvac.dto.agendaVacinal.AgendaVacinalRequestDTO;
import com.locvac.dto.agendaVacinal.AgendaVacinalResponseDTO;
import com.locvac.service.AgendaVacinalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendas-vacinais")
public class AgendaVacinalController {

    private final AgendaVacinalService service;

    public AgendaVacinalController(AgendaVacinalService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AgendaVacinalResponseDTO> criar(@RequestBody @Valid AgendaVacinalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @GetMapping
    public List<AgendaVacinalResponseDTO> listar(@RequestParam(required = false) Long idPessoa) {
        return idPessoa != null ? service.listarPorPessoa(idPessoa) : service.listar();
    }

    @GetMapping("/{id}")
    public AgendaVacinalResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public AgendaVacinalResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid AgendaVacinalRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
