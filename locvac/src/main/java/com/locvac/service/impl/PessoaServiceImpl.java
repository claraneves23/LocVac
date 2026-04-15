package com.locvac.service.impl;

import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;
import com.locvac.mapper.PessoaMapper;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.model.enums.TipoVinculo;
import com.locvac.model.core.Pessoa;
import com.locvac.repository.PessoaRepository;
import com.locvac.service.PessoaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PessoaServiceImpl implements PessoaService {

    private final PessoaRepository repository;
    private final PessoaMapper mapper;
    private final UsuarioPessoaRepository usuarioPessoaRepository;

    public PessoaServiceImpl(PessoaRepository repository, PessoaMapper mapper, UsuarioPessoaRepository usuarioPessoaRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
    }
    @Override
    public List<PessoaResponseDTO> listarDependentes(java.util.UUID usuarioId) {
        TipoVinculo tipoDependente = TipoVinculo.getByCodigo(3);
        List<UsuarioPessoa> dependentes = usuarioPessoaRepository.findByUsuarioIdAndTipoVinculo(usuarioId, tipoDependente);
        return dependentes.stream()
            .map(vinculo -> mapper.toResponse(vinculo.getPessoa(), vinculo.getDscParentesco()))
            .toList();
    }

    @Override
    public PessoaResponseDTO cadastrar(PessoaRequestDTO dto) {
        Pessoa pessoa = mapper.toEntity(dto);
        Pessoa salvo = repository.save(pessoa);
        return mapper.toResponse(salvo);
    }

    @Override
    public List<PessoaResponseDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public PessoaResponseDTO getPerfil(Long idPessoa) {
        Pessoa pessoa = repository.findById(idPessoa)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        return mapper.toResponse(pessoa);
    }
}
