package com.locvac.controller;

import com.locvac.dto.vacina.VacinaRequestDTO;
import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.model.core.Vacina;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.repository.VacinaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public List<VacinaResponseDTO> listar(@RequestParam(required = false) TipoSecaoVacinacao tipo) {
        var vacinas = tipo != null
                ? repository.findByTipoSecaoVacinacaoAndAtivaTrue(tipo)
                : repository.findByAtivaTrue();
        return vacinas.stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<VacinaResponseDTO> criar(@RequestBody VacinaRequestDTO dto) {
        Vacina v = new Vacina();
        v.setNome(dto.getNome());
        v.setDescricao(dto.getDescricao());
        v.setDose(dto.getDose());
        v.setViaAdministracao(dto.getViaAdministracao());
        v.setCodigoPNI(dto.getCodigoPNI());
        v.setAtiva(true);
        v.setTipoSecaoVacinacao(dto.getTipoSecaoVacinacao());
        v.setIdadeMinimaMeses(dto.getIdadeMinimaMeses());
        v.setIdadeMaximaMeses(dto.getIdadeMaximaMeses());
        Vacina saved = repository.save(v);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    private VacinaResponseDTO toResponse(Vacina v) {
        return new VacinaResponseDTO(
                v.getId(),
                v.getNome(),
                v.getDescricao(),
                v.getDose(),
                v.getCodigoPNI(),
                v.getTipoSecaoVacinacao(),
                v.getIdadeMinimaMeses(),
                v.getIdadeMaximaMeses()
        );
    }

    // atualizar vacina
    // deletar vacina (na verdade, só desativar, para não perder histórico de doses aplicadas)
}
