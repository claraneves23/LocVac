package com.locvac.service.impl;

import com.locvac.dto.ParticipacaoCampanhaPatchDTO;
import com.locvac.dto.ParticipacaoCampanhaRequestDTO;
import com.locvac.dto.ParticipacaoCampanhaResponseDTO;
import com.locvac.mapper.ParticipacaoCampanhaMapper;
import com.locvac.model.associacao.ParticipacaoCampanha;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.repository.ParticipacaoCampanhaRepository;
import com.locvac.service.ParticipacaoCampanhaService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ParticipacaoCampanhaServiceImpl implements ParticipacaoCampanhaService {

    private final ParticipacaoCampanhaMapper participacaoCampanhaMapper;
    private final ParticipacaoCampanhaRepository participacaoCampanhaRepository;

    public ParticipacaoCampanhaServiceImpl(ParticipacaoCampanhaMapper participacaoCampanhaMapper, ParticipacaoCampanhaRepository participacaoCampanhaRepository) {
        this.participacaoCampanhaMapper = participacaoCampanhaMapper;
        this.participacaoCampanhaRepository = participacaoCampanhaRepository;
    }

    @Override
    public void cadastrarParticipacaoCampanha(ParticipacaoCampanhaRequestDTO dto) {
        ParticipacaoCampanha participacao = participacaoCampanhaMapper.toEntity(dto);
        participacao.setId(UUID.randomUUID().toString());
        participacaoCampanhaRepository.save(participacao);
    }

    @Override
    public List<ParticipacaoCampanhaResponseDTO> listarParticipacoesCampanha() {
        return participacaoCampanhaRepository.findAll()
                .stream()
                .map(participacaoCampanhaMapper::toResponse)
                .toList();
    }

    @Override
    public ParticipacaoCampanha buscarPorId(String id) {
        return participacaoCampanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participação em campanha não encontrada"));
    }

    @Override
    public void removerParticipacaoCampanha(String id) {
        ParticipacaoCampanha participacao = participacaoCampanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participação em campanha não existe"));

        participacaoCampanhaRepository.delete(participacao);
    }

    @Override
    public void atualizarParticipacaoCampanha(String id, ParticipacaoCampanhaPatchDTO dto) {
        ParticipacaoCampanha participacao = participacaoCampanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participação em campanha não encontrada"));

        if (dto.pessoaId() != null) {
            participacao.setPessoa(new Pessoa(dto.pessoaId()));
        }

        if (dto.campanhaId() != null) {
            participacao.setCampanha(new Campanha(dto.campanhaId()));
        }

        if (dto.dataParticipacao() != null) {
            participacao.setDataParticipacao(dto.dataParticipacao());
        }

        participacaoCampanhaRepository.save(participacao);
    }
}
