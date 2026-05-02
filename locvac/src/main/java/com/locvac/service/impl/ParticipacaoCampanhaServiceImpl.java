package com.locvac.service.impl;

import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.participacaoCampanha.ParticipacaoCampanhaResponseDTO;
import com.locvac.mapper.ParticipacaoCampanhaMapper;
import com.locvac.model.associacao.ParticipacaoCampanha;
import com.locvac.repository.CampanhaRepository;
import com.locvac.repository.ParticipacaoCampanhaRepository;
import com.locvac.repository.PessoaRepository;
import com.locvac.service.ParticipacaoCampanhaService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ParticipacaoCampanhaServiceImpl implements ParticipacaoCampanhaService {
    private final ParticipacaoCampanhaRepository repository;
    private final PessoaRepository pessoaRepository;
    private final CampanhaRepository campanhaRepository;
    private final ParticipacaoCampanhaMapper mapper;

    public ParticipacaoCampanhaServiceImpl(ParticipacaoCampanhaRepository repository, PessoaRepository pessoaRepository, CampanhaRepository campanhaRepository, ParticipacaoCampanhaMapper mapper) {
        this.repository = repository;
        this.pessoaRepository = pessoaRepository;
        this.campanhaRepository = campanhaRepository;
        this.mapper = mapper;
    }

    @Override
    public ParticipacaoCampanhaResponseDTO cadastrar(ParticipacaoCampanhaRequestDTO dto) {
        validarPessoaExiste(dto.idPessoa());
        validarCampanhaExiste(dto.idCampanha());
        ParticipacaoCampanha participacao = mapper.toEntity(dto);
        ParticipacaoCampanha salvo = repository.save(participacao);
        return mapper.toResponse(salvo);
    }

    @Override
    public List<ParticipacaoCampanhaResponseDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public List<ParticipacaoCampanhaResponseDTO> listarPorPessoa(Long idPessoa) {
        return repository.findByPessoaId(idPessoa)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ParticipacaoCampanhaResponseDTO atualizar(Long id, ParticipacaoCampanhaRequestDTO dto) {
        ParticipacaoCampanha participacao = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Participação não encontrada com o ID: " + id));
        validarCampanhaExiste(dto.idCampanha());
        participacao.setCampanha(new com.locvac.model.core.Campanha(dto.idCampanha()));
        participacao.setDataParticipacao(dto.dataParticipacao());
        return mapper.toResponse(repository.save(participacao));
    }

    @Override
    public void remover(Long id) {
        ParticipacaoCampanha participacao = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Participação não encontrada com o ID: " + id));
        repository.delete(participacao);
    }

    private void validarPessoaExiste(Long idPessoa) {
        if (!pessoaRepository.existsById(idPessoa)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Pessoa não encontrada com o ID: " + idPessoa);
        }
    }

    private void validarCampanhaExiste(Long idCampanha) {
        if (!campanhaRepository.existsById(idCampanha)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Campanha não encontrada com o ID: " + idCampanha);
        }
    }
}
