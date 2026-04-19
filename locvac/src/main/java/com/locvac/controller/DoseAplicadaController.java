package com.locvac.controller;

import com.locvac.dto.doseAplicada.DoseAplicadaRequestDTO;
import com.locvac.dto.doseAplicada.DoseAplicadaResponseDTO;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.service.DoseAplicadaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doses")
public class DoseAplicadaController {

    private final DoseAplicadaService service;

    public DoseAplicadaController(DoseAplicadaService service) {
        this.service = service;
    }

    @PostMapping("/registrar")
    public ResponseEntity<DoseAplicadaResponseDTO> registrar(@RequestBody @Valid DoseAplicadaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
    }

    @PutMapping("/{idDose}")
    public ResponseEntity<DoseAplicadaResponseDTO> atualizar(@PathVariable Long idDose,
                                                             @RequestBody @Valid DoseAplicadaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(idDose, dto));
    }

    @DeleteMapping("/{idDose}")
    public ResponseEntity<Void> deletar(@PathVariable Long idDose) {
        service.deletar(idDose);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/por-pessoa/{idPessoa}")
    public List<DoseAplicadaResponseDTO> listarPorPessoa(@PathVariable Long idPessoa) {
        return service.listarPorPessoa(idPessoa);
    }

    @GetMapping("/por-pessoa/{idPessoa}/tipo/{tipo}")
    public List<DoseAplicadaResponseDTO> listarPorPessoaETipo(@PathVariable Long idPessoa,
                                                               @PathVariable TipoSecaoVacinacao tipo) {
        return service.listarPorPessoaETipo(idPessoa, tipo);
    }
}
