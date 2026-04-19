package com.locvac.service.impl;

import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaRequestDTO;
import com.locvac.dto.vacinaSecaoInformativa.VacinaSecaoInformativaResponseDTO;
import com.locvac.mapper.VacinaSecaoInformativaMapper;
import com.locvac.model.associacao.VacinaInformativo;
import com.locvac.model.associacao.VacinaSecaoInformativa;
import com.locvac.repository.VacinaInformativoRepository;
import com.locvac.repository.VacinaSecaoInformativaRepository;
import com.locvac.service.VacinaSecaoInformativaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacinaSecaoInformativaServiceImpl implements VacinaSecaoInformativaService {

    private final VacinaSecaoInformativaRepository repository;
    private final VacinaInformativoRepository informativoRepository;
    private final VacinaSecaoInformativaMapper mapper;

    public VacinaSecaoInformativaServiceImpl(VacinaSecaoInformativaRepository repository,
                                             VacinaInformativoRepository informativoRepository,
                                             VacinaSecaoInformativaMapper mapper) {
        this.repository = repository;
        this.informativoRepository = informativoRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public VacinaSecaoInformativaResponseDTO create(VacinaSecaoInformativaRequestDTO dto) {
        VacinaInformativo informativo = informativoRepository.findById(dto.getIdInformativo())
                .orElseThrow(() -> new RuntimeException("Informativo não encontrado"));
        VacinaSecaoInformativa entity = mapper.toEntity(dto);
        entity.setInformativo(informativo);
        VacinaSecaoInformativa saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VacinaSecaoInformativaResponseDTO update(Long id, VacinaSecaoInformativaRequestDTO dto) {
        VacinaSecaoInformativa entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seção não encontrada"));
        VacinaInformativo informativo = informativoRepository.findById(dto.getIdInformativo())
                .orElseThrow(() -> new RuntimeException("Informativo não encontrado"));
        entity.setInformativo(informativo);
        entity.setTituloSecao(dto.getTituloSecao());
        entity.setConteudo(dto.getConteudo());
        entity.setOrdemExibicao(dto.getOrdemExibicao());
        VacinaSecaoInformativa updated = repository.save(entity);
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Seção não encontrada");
        }
        repository.deleteById(id);
    }

    @Override
    public VacinaSecaoInformativaResponseDTO findById(Long id) {
        VacinaSecaoInformativa entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seção não encontrada"));
        return mapper.toResponse(entity);
    }

    @Override
    public List<VacinaSecaoInformativaResponseDTO> findByInformativo(Long idInformativo) {
        return repository.findByInformativoIdOrderByOrdemExibicao(idInformativo).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}