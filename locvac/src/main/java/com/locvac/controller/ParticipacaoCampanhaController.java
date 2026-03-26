package com.locvac.controller;

import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaResponseDTO;
import com.locvac.service.ParticipacaoCampanhaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/participacaoCampanha")
public class ParticipacaoCampanhaController {

    private final ParticipacaoCampanhaService service;

    public ParticipacaoCampanhaController(ParticipacaoCampanhaService service) {
        this.service = service;
    }

    @PostMapping("/novaParticipacao")
    public ResponseEntity<ParticipacaoCampanhaResponseDTO> cadastrar(@RequestBody @Valid ParticipacaoCampanhaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @GetMapping("/por-pessoa/{idPessoa}")
    public ResponseEntity<List<ParticipacaoCampanhaResponseDTO>> listarPorPessoa(@PathVariable Long idPessoa) {
        return ResponseEntity.ok(service.listarPorPessoa(idPessoa));
    }

    @GetMapping
    public ResponseEntity<List<ParticipacaoCampanhaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

}
