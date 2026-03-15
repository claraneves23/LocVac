package com.locvac.controller;

import com.locvac.dto.ParticipacaoCampanhaPatchDTO;
import com.locvac.dto.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.ParticipacaoCampanhaResponseDTO;
import com.locvac.mapper.ParticipacaoCampanhaMapper;
import com.locvac.model.associacao.ParticipacaoCampanha;
import com.locvac.service.ParticipacaoCampanhaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/participacoes-campanha")
public class ParticipacaoCampanhaController {

    private final ParticipacaoCampanhaService participacaoCampanhaService;
    private final ParticipacaoCampanhaMapper participacaoCampanhaMapper;

    public ParticipacaoCampanhaController(ParticipacaoCampanhaService participacaoCampanhaService, ParticipacaoCampanhaMapper participacaoCampanhaMapper) {
        this.participacaoCampanhaService = participacaoCampanhaService;
        this.participacaoCampanhaMapper = participacaoCampanhaMapper;
    }

    @PostMapping("/nova")
    public ResponseEntity<Void> cadastrarParticipacaoCampanha(@RequestBody @Valid ParticipacaoCampanhaRequestDTO dto) {
        participacaoCampanhaService.cadastrarParticipacaoCampanha(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public List<ParticipacaoCampanhaResponseDTO> listarParticipacoesCampanha() {
        return participacaoCampanhaService.listarParticipacoesCampanha();
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarParticipacaoCampanha(@PathVariable String id) {
        participacaoCampanhaService.removerParticipacaoCampanha(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ParticipacaoCampanhaResponseDTO> buscarPorId(@PathVariable String id) {
        ParticipacaoCampanha participacao = participacaoCampanhaService.buscarPorId(id);
        return ResponseEntity.ok(participacaoCampanhaMapper.toResponse(participacao));
    }

}
