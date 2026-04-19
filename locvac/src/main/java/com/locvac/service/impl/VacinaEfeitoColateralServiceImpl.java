package com.locvac.service.impl;

import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralRequestDTO;
import com.locvac.dto.vacinaEfeitoColateral.VacinaEfeitoColateralResponseDTO;
import com.locvac.mapper.VacinaEfeitoColateralMapper;
import com.locvac.model.associacao.VacinaEfeitoColateral;
import com.locvac.model.core.Vacina;
import com.locvac.model.enums.Severidade;
import com.locvac.repository.VacinaEfeitoColateralRepository;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.VacinaEfeitoColateralService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacinaEfeitoColateralServiceImpl implements VacinaEfeitoColateralService {

    private final VacinaEfeitoColateralRepository repository;
    private final VacinaRepository vacinaRepository;
    private final VacinaEfeitoColateralMapper mapper;

    public VacinaEfeitoColateralServiceImpl(VacinaEfeitoColateralRepository repository,
                                            VacinaRepository vacinaRepository,
                                            VacinaEfeitoColateralMapper mapper) {
        this.repository = repository;
        this.vacinaRepository = vacinaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public VacinaEfeitoColateralResponseDTO create(VacinaEfeitoColateralRequestDTO dto) {
        Vacina vacina = vacinaRepository.findById(dto.getIdVacina())
                .orElseThrow(() -> new RuntimeException("Vacina não encontrada"));
        VacinaEfeitoColateral entity = mapper.toEntity(dto);
        entity.setVacina(vacina);
        VacinaEfeitoColateral saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VacinaEfeitoColateralResponseDTO update(Long id, VacinaEfeitoColateralRequestDTO dto) {
        VacinaEfeitoColateral entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Efeito colateral não encontrado"));
        Vacina vacina = vacinaRepository.findById(dto.getIdVacina())
                .orElseThrow(() -> new RuntimeException("Vacina não encontrada"));
        entity.setVacina(vacina);
        entity.setDescricao(dto.getDescricao());
        entity.setSeveridade(dto.getSeveridade());
        entity.setOrientacao(dto.getOrientacao());
        VacinaEfeitoColateral updated = repository.save(entity);
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Efeito colateral não encontrado");
        }
        repository.deleteById(id);
    }

    @Override
    public VacinaEfeitoColateralResponseDTO findById(Long id) {
        VacinaEfeitoColateral entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Efeito colateral não encontrado"));
        return mapper.toResponse(entity);
    }

    @Override
    public List<VacinaEfeitoColateralResponseDTO> findByVacina(Long idVacina) {
        return repository.findByVacinaId(idVacina).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VacinaEfeitoColateralResponseDTO> findBySeveridade(Severidade severidade) {
        return repository.findBySeveridade(severidade).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}