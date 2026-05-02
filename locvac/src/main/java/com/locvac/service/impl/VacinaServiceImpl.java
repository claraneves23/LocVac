package com.locvac.service.impl;

import com.locvac.dto.vacina.VacinaRequestDTO;
import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.mapper.VacinaMapper;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.VacinaService;
import com.locvac.utils.ValidacaoPeriodoUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class VacinaServiceImpl implements VacinaService {

    private final VacinaRepository vacinaRepository;
    private final VacinaMapper vacinaMapper;

    public VacinaServiceImpl(VacinaRepository vacinaRepository, VacinaMapper vacinaMapper) {
        this.vacinaRepository = vacinaRepository;
        this.vacinaMapper = vacinaMapper;
    }

    @Override
    public VacinaResponseDTO criar(VacinaRequestDTO dto) {
        ValidacaoPeriodoUtils.validarIdadeMinimaMenorQueMaxima(dto.getIdadeMinimaMeses(), dto.getIdadeMaximaMeses());
        var vacina = vacinaMapper.toEntity(dto);
        vacina.setAtiva(true);
        return vacinaMapper.toResponse(vacinaRepository.save(vacina));
    }

    @Override
    public List<VacinaResponseDTO> listar(TipoSecaoVacinacao tipo) {
        var vacinas = tipo != null
                ? vacinaRepository.findByTipoSecaoVacinacaoAndAtivaTrue(tipo)
                : vacinaRepository.findByAtivaTrue();
        return vacinas.stream()
                .map(vacinaMapper::toResponse)
                .toList();
    }
}
