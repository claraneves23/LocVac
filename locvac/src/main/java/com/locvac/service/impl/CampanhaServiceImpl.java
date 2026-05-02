package com.locvac.service.impl;

import com.locvac.dto.campanha.CampanhaRequestDTO;
import com.locvac.dto.campanha.CampanhaResponseDTO;
import com.locvac.mapper.CampanhaMapper;
import com.locvac.model.core.Campanha;
import com.locvac.repository.CampanhaRepository;
import com.locvac.repository.NotificacaoRepository;
import com.locvac.repository.ParticipacaoCampanhaRepository;
import com.locvac.service.CampanhaService;
import com.locvac.utils.ValidacaoPeriodoUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CampanhaServiceImpl implements CampanhaService {

    private final CampanhaMapper campanhaMapper;
    private final CampanhaRepository campanhaRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final ParticipacaoCampanhaRepository participacaoCampanhaRepository;

    public CampanhaServiceImpl(
            CampanhaMapper campanhaMapper,
            CampanhaRepository campanhaRepository,
            NotificacaoRepository notificacaoRepository,
            ParticipacaoCampanhaRepository participacaoCampanhaRepository
    ) {
        this.campanhaMapper = campanhaMapper;
        this.campanhaRepository = campanhaRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.participacaoCampanhaRepository = participacaoCampanhaRepository;
    }

    @Override
    public void cadastrarCampanha(CampanhaRequestDTO dto) {
        ValidacaoPeriodoUtils.validarDataFinalPosterior(dto.dataInicio(), dto.dataFim());
        validarCampanhaDuplicada(dto.doencaAlvo(), dto.dataInicio(), dto.dataFim());
        Campanha campanha = campanhaMapper.toEntity(dto);
        campanhaRepository.save(campanha);
    }

    @Override
    public List<CampanhaResponseDTO> listarCampanhas() {
        return campanhaRepository.findAll()
                .stream()
                .map(campanhaMapper::toResponse)
                .toList();
    }


    @Override
    public Campanha buscarPorId(Long id) {
        return campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada"));
    }

    @Override
    public void removerCampanha(Long id) {
        Campanha campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não existe"));

        notificacaoRepository.deleteAll(notificacaoRepository.findByCampanhaId(id));
        participacaoCampanhaRepository.deleteAll(participacaoCampanhaRepository.findByCampanhaId(id));
        campanhaRepository.delete(campanha);
    }


    @Override
    public CampanhaResponseDTO atualizarCampanha(Long id, CampanhaRequestDTO dto) {
        ValidacaoPeriodoUtils.validarDataFinalPosterior(dto.dataInicio(), dto.dataFim());
        Campanha campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada"));
        campanha.setNome(dto.nome());
        campanha.setDoencaAlvo(dto.doencaAlvo());
        campanha.setDataInicio(dto.dataInicio());
        campanha.setDataFim(dto.dataFim());
        campanha.setPublicoAlvo(dto.publicoAlvo());
        campanha.setAtiva(dto.ativa());
        return campanhaMapper.toResponse(campanhaRepository.save(campanha));
    }

    private void validarCampanhaDuplicada(String doencaAlvo, LocalDate dataInicio, LocalDate dataFim) {
        boolean existe = campanhaRepository.existsByDoencaAlvoAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(doencaAlvo, dataInicio, dataFim);

        if (existe) {
            throw new RuntimeException("Campanha já cadastrada");
        }
    }

}
