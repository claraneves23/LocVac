package com.locvac.service.impl;

import com.locvac.dto.carrosselItem.CarrosselItemRequestDTO;
import com.locvac.dto.carrosselItem.CarrosselItemResponseDTO;
import com.locvac.mapper.CarrosselItemMapper;
import com.locvac.model.core.CarrosselItem;
import com.locvac.repository.CarrosselItemRepository;
import com.locvac.service.CarrosselItemService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarrosselItemServiceImpl implements CarrosselItemService {

    private final CarrosselItemRepository repository;
    private final CarrosselItemMapper mapper;

    public CarrosselItemServiceImpl(CarrosselItemRepository repository, CarrosselItemMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public CarrosselItemResponseDTO create(CarrosselItemRequestDTO dto) {
        CarrosselItem entity = mapper.toEntity(dto);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public CarrosselItemResponseDTO update(Long id, CarrosselItemRequestDTO dto) {
        CarrosselItem entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item do carrossel não encontrado"));
        entity.setTitulo(dto.titulo());
        entity.setDescricao(dto.descricao());
        entity.setImagemUrl(dto.imagemUrl());
        entity.setOrdemExibicao(dto.ordemExibicao());
        entity.setAtivo(dto.ativo());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Item do carrossel não encontrado");
        }
        repository.deleteById(id);
    }

    @Override
    public CarrosselItemResponseDTO findById(Long id) {
        CarrosselItem entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item do carrossel não encontrado"));
        return mapper.toResponse(entity);
    }

    @Override
    public List<CarrosselItemResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CarrosselItemResponseDTO> findAtivos() {
        return repository.findByAtivoTrueOrderByOrdemExibicaoAsc().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}
