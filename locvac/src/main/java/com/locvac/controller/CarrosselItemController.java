package com.locvac.controller;

import com.locvac.dto.carrosselItem.CarrosselItemRequestDTO;
import com.locvac.dto.carrosselItem.CarrosselItemResponseDTO;
import com.locvac.service.CarrosselItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrossel")
public class CarrosselItemController {

    private final CarrosselItemService service;

    public CarrosselItemController(CarrosselItemService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CarrosselItemResponseDTO> create(@RequestBody CarrosselItemRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarrosselItemResponseDTO> update(@PathVariable Long id, @RequestBody CarrosselItemRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarrosselItemResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<CarrosselItemResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<CarrosselItemResponseDTO>> findAtivos() {
        return ResponseEntity.ok(service.findAtivos());
    }
}
