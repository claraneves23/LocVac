package com.locvac.service.impl;

import com.locvac.dto.carrosselConteudo.CarrosselConteudoRequestDTO;
import com.locvac.dto.carrosselConteudo.CarrosselConteudoResponseDTO;
import com.locvac.mapper.CarrosselConteudoMapper;
import com.locvac.model.associacao.CarrosselConteudo;
import com.locvac.model.core.CarrosselItem;
import com.locvac.repository.CarrosselConteudoRepository;
import com.locvac.repository.CarrosselItemRepository;
import com.locvac.service.CarrosselConteudoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarrosselConteudoServiceImpl implements CarrosselConteudoService {

    private final CarrosselConteudoRepository repository;
    private final CarrosselItemRepository carrosselItemRepository;
    private final CarrosselConteudoMapper mapper;

    public CarrosselConteudoServiceImpl(CarrosselConteudoRepository repository,
                                        CarrosselItemRepository carrosselItemRepository,
                                        CarrosselConteudoMapper mapper) {
        this.repository = repository;
        this.carrosselItemRepository = carrosselItemRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public CarrosselConteudoResponseDTO create(CarrosselConteudoRequestDTO dto) {
        CarrosselItem item = carrosselItemRepository.findById(dto.idCarrosselItem())
                .orElseThrow(() -> new RuntimeException("Item do carrossel não encontrado"));
        CarrosselConteudo entity = mapper.toEntity(dto);
        entity.setCarrosselItem(item);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public CarrosselConteudoResponseDTO update(Long id, CarrosselConteudoRequestDTO dto) {
        CarrosselConteudo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conteúdo não encontrado"));
        entity.setTituloSecao(dto.tituloSecao());
        entity.setConteudo(dto.conteudo());
        entity.setItens(dto.itens() != null ? dto.itens() : new java.util.ArrayList<>());
        entity.setOrdemExibicao(dto.ordemExibicao());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Conteúdo não encontrado");
        }
        repository.deleteById(id);
    }

    @Override
    public CarrosselConteudoResponseDTO findById(Long id) {
        CarrosselConteudo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conteúdo não encontrado"));
        return mapper.toResponse(entity);
    }

    @Override
    public List<CarrosselConteudoResponseDTO> findByCarrosselItem(Long idCarrosselItem) {
        return repository.findByCarrosselItemIdOrderByOrdemExibicaoAsc(idCarrosselItem).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}
