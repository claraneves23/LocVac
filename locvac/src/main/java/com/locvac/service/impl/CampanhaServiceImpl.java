package com.locvac.service.impl;

import com.locvac.dto.CampanhaPatchDTO;
import com.locvac.dto.CampanhaRequestDTO;
import com.locvac.dto.CampanhaResponseDTO;
import com.locvac.mapper.CampanhaMapper;
import com.locvac.model.core.Campanha;
import com.locvac.repository.CampanhaRepository;
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

    public CampanhaServiceImpl(CampanhaMapper campanhaMapper, CampanhaRepository campanhaRepository) {
        this.campanhaMapper = campanhaMapper;
        this.campanhaRepository = campanhaRepository;
    }

    @Override
    public void cadastrarCampanha(CampanhaRequestDTO dto) {
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

        campanhaRepository.delete(campanha);
    }

    @Override
    public void atualizarCampanha(Long id, CampanhaPatchDTO dto) {
        Campanha campanha =  campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada"));

        if (dto.nome() != null) {
            campanha.setNome(dto.nome());
        }

        if (dto.doencaAlvo() != null) {
            campanha.setDoencaAlvo(dto.doencaAlvo());
        }

        if(dto.dataInicio() != null) {
            campanha.setDataInicio(dto.dataInicio());
        }

        if(dto.dataFim() != null) {
            campanha.setDataFim(dto.dataFim());
        }

        if (dto.publicoAlvo() != null) {
            campanha.setPublicoAlvo(dto.publicoAlvo());
        }

        campanha.setAtiva(dto.ativa());

        ValidacaoPeriodoUtils.validarDataFinalPosterior(campanha.getDataInicio(), campanha.getDataFim());

        validarCampanhaDuplicada(campanha.getDoencaAlvo(), campanha.getDataInicio(), campanha.getDataFim());

        campanhaRepository.save(campanha);

    }

    private void validarCampanhaDuplicada(String doencaAlvo, LocalDate dataInicio, LocalDate dataFim) {
        boolean existe = campanhaRepository.existsByDoencaAlvoAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(doencaAlvo, dataInicio, dataFim);

        if (existe) {
            throw new RuntimeException("Campanha já cadastrada");
        }
    }

}
