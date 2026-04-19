package com.locvac.controller;

import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.repository.VacinaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacinas")
public class VacinaController {

    private final VacinaRepository repository;

    public VacinaController(VacinaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<VacinaResponseDTO> listarPorTipo(@RequestParam TipoSecaoVacinacao tipo) {
        return repository.findByTipoSecaoVacinacaoAndAtivaTrue(tipo).stream()
                .map(v -> new VacinaResponseDTO(v.getId(), v.getNome(), v.getDescricao(), v.getDose(), v.getCodigoPNI(), v.getTipoSecaoVacinacao()))
                .toList();
    }
}
