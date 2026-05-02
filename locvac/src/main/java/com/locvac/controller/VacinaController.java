package com.locvac.controller;

import com.locvac.dto.vacina.VacinaRequestDTO;
import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.service.VacinaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacinas")
public class VacinaController {

    private final VacinaService vacinaService;

    public VacinaController(VacinaService vacinaService) {
        this.vacinaService = vacinaService;
    }

    @GetMapping
    public List<VacinaResponseDTO> listar(@RequestParam(required = false) TipoSecaoVacinacao tipo) {
        return vacinaService.listar(tipo);
    }

    @PostMapping
    public ResponseEntity<VacinaResponseDTO> criar(@RequestBody VacinaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vacinaService.criar(dto));
    }
}
