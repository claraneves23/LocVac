package com.locvac.service.impl;

import com.locvac.dto.grupoRisco.GrupoRiscoRequestDTO;
import com.locvac.dto.grupoRisco.GrupoRiscoResponseDTO;
import com.locvac.mapper.GrupoRiscoMapper;
import com.locvac.model.core.GrupoRisco;
import com.locvac.repository.GrupoRiscoRepository;
import com.locvac.service.GrupoRiscoService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class GrupoRiscoServiceImpl implements GrupoRiscoService {

    private final GrupoRiscoRepository repository;
    private final GrupoRiscoMapper mapper;

    public GrupoRiscoServiceImpl(GrupoRiscoRepository repository, GrupoRiscoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public GrupoRiscoResponseDTO criar(GrupoRiscoRequestDTO dto) {
        GrupoRisco g = new GrupoRisco();
        g.setNome(dto.nome());
        g.setDescricao(dto.descricao());
        return mapper.toResponse(repository.save(g));
    }

    @Override
    public List<GrupoRiscoResponseDTO> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public GrupoRiscoResponseDTO buscarPorId(Long id) {
        return mapper.toResponse(buscar(id));
    }

    @Override
    public GrupoRiscoResponseDTO atualizar(Long id, GrupoRiscoRequestDTO dto) {
        GrupoRisco g = buscar(id);
        g.setNome(dto.nome());
        g.setDescricao(dto.descricao());
        return mapper.toResponse(repository.save(g));
    }

    @Override
    public void remover(Long id) {
        repository.delete(buscar(id));
    }

    private GrupoRisco buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo de risco não encontrado."));
    }
}
