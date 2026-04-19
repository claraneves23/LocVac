package com.locvac.service.impl;

import com.locvac.dto.vacinaInformativo.VacinaInformativoRequestDTO;
import com.locvac.dto.vacinaInformativo.VacinaInformativoResponseDTO;
import com.locvac.mapper.VacinaInformativoMapper;
import com.locvac.model.associacao.VacinaInformativo;
import com.locvac.model.core.Vacina;
import com.locvac.repository.VacinaInformativoRepository;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.VacinaInformativoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacinaInformativoServiceImpl implements VacinaInformativoService {

    private final VacinaInformativoRepository repository;
    private final VacinaRepository vacinaRepository;
    private final VacinaInformativoMapper mapper;

    public VacinaInformativoServiceImpl(VacinaInformativoRepository repository,
                                        VacinaRepository vacinaRepository,
                                        VacinaInformativoMapper mapper) {
        this.repository = repository;
        this.vacinaRepository = vacinaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public VacinaInformativoResponseDTO create(VacinaInformativoRequestDTO dto) {
        Vacina vacina = vacinaRepository.findById(dto.getIdVacina())
                .orElseThrow(() -> new RuntimeException("Vacina não encontrada"));
        VacinaInformativo entity = mapper.toEntity(dto);
        entity.setVacina(vacina);
        VacinaInformativo saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VacinaInformativoResponseDTO update(Long id, VacinaInformativoRequestDTO dto) {
        VacinaInformativo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informativo não encontrado"));
        Vacina vacina = vacinaRepository.findById(dto.getIdVacina())
                .orElseThrow(() -> new RuntimeException("Vacina não encontrada"));
        entity.setVacina(vacina);
        entity.setVersao(dto.getVersao());
        entity.setDataPublicacao(dto.getDataPublicacao());
        entity.setOrgaoEmissor(dto.getOrgaoEmissor());
        entity.setFonteReferencia(dto.getFonteReferencia());
        entity.setAtiva(dto.isAtiva());
        VacinaInformativo updated = repository.save(entity);
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Informativo não encontrado");
        }
        repository.deleteById(id);
    }

    @Override
    public VacinaInformativoResponseDTO findById(Long id) {
        VacinaInformativo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informativo não encontrado"));
        return mapper.toResponse(entity);
    }

    @Override
    public List<VacinaInformativoResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VacinaInformativoResponseDTO> findByVacina(Long idVacina) {
        return repository.findByVacinaIdAndAtivaTrue(idVacina).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VacinaInformativoResponseDTO findAtivoByVacina(Long idVacina) {
        List<VacinaInformativo> ativos = repository.findByVacinaIdAndAtivaTrue(idVacina);
        if (ativos.isEmpty()) {
            throw new RuntimeException("Nenhum informativo ativo encontrado para a vacina");
        }
        // Assume o primeiro ou o mais recente
        return mapper.toResponse(ativos.get(0));
    }
}