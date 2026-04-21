package com.locvac.controller;

import com.locvac.dto.carrosselConteudo.CarrosselConteudoRequestDTO;
import com.locvac.dto.carrosselConteudo.CarrosselConteudoResponseDTO;
import com.locvac.service.CarrosselConteudoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrossel-conteudo")
public class CarrosselConteudoController {

    private final CarrosselConteudoService service;

    public CarrosselConteudoController(CarrosselConteudoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CarrosselConteudoResponseDTO> create(@RequestBody CarrosselConteudoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarrosselConteudoResponseDTO> update(@PathVariable Long id, @RequestBody CarrosselConteudoRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarrosselConteudoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/item/{idCarrosselItem}")
    public ResponseEntity<List<CarrosselConteudoResponseDTO>> findByCarrosselItem(@PathVariable Long idCarrosselItem) {
        return ResponseEntity.ok(service.findByCarrosselItem(idCarrosselItem));
    }
}
