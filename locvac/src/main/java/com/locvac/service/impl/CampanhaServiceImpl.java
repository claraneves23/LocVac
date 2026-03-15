package com.locvac.service.impl;

import com.locvac.dto.CampanhaRequestDTO;
import com.locvac.dto.CampanhaResponseDTO;
import com.locvac.mapper.CampanhaMapper;
import com.locvac.model.core.Campanha;
import com.locvac.repository.CampanhaRepository;
import com.locvac.service.CampanhaService;
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


    private void validarCampanhaDuplicada(String doencaAlvo, LocalDate dataInicio, LocalDate dataFim) {
        boolean existe = campanhaRepository.existsByDoencaAlvoAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(doencaAlvo, dataInicio, dataFim);

        if (existe) {
            throw new RuntimeException("Campanha já cadastrada");
        }
    }

}
