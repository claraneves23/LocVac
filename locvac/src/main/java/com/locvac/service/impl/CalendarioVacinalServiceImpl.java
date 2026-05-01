package com.locvac.service.impl;

import com.locvac.dto.calendarioVacinal.CalendarioVacinalRequestDTO;
import com.locvac.dto.calendarioVacinal.CalendarioVacinalResponseDTO;
import com.locvac.mapper.CalendarioVacinalMapper;
import com.locvac.model.associacao.CalendarioVacinal;
import com.locvac.model.core.Vacina;
import com.locvac.repository.CalendarioVacinalRepository;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.CalendarioVacinalService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CalendarioVacinalServiceImpl implements CalendarioVacinalService {

    private final CalendarioVacinalRepository repository;
    private final VacinaRepository vacinaRepository;
    private final CalendarioVacinalMapper mapper;

    public CalendarioVacinalServiceImpl(
            CalendarioVacinalRepository repository,
            VacinaRepository vacinaRepository,
            CalendarioVacinalMapper mapper
    ) {
        this.repository = repository;
        this.vacinaRepository = vacinaRepository;
        this.mapper = mapper;
    }

    @Override
    public CalendarioVacinalResponseDTO criar(CalendarioVacinalRequestDTO dto) {
        CalendarioVacinal c = new CalendarioVacinal();
        aplicar(c, dto);
        return mapper.toResponse(repository.save(c));
    }

    @Override
    public List<CalendarioVacinalResponseDTO> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public CalendarioVacinalResponseDTO buscarPorId(Long id) {
        return mapper.toResponse(buscar(id));
    }

    @Override
    public CalendarioVacinalResponseDTO atualizar(Long id, CalendarioVacinalRequestDTO dto) {
        CalendarioVacinal c = buscar(id);
        aplicar(c, dto);
        return mapper.toResponse(repository.save(c));
    }

    @Override
    public void remover(Long id) {
        CalendarioVacinal c = buscar(id);
        repository.delete(c);
    }

    private CalendarioVacinal buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendário não encontrado."));
    }

    private void aplicar(CalendarioVacinal c, CalendarioVacinalRequestDTO dto) {
        Vacina vacina = vacinaRepository.findById(dto.idVacina())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacina não encontrada."));
        c.setVacina(vacina);
        c.setFaixaEtariaMinMeses(dto.faixaEtariaMinMeses());
        c.setFaixaEtariaMaxMeses(dto.faixaEtariaMaxMeses());
        c.setPublicoAlvo(dto.publicoAlvo());
        c.setObrigatoria(Boolean.TRUE.equals(dto.obrigatoria()));
        c.setNumeroDose(dto.numeroDose());
        c.setDescricaoDose(dto.descricaoDose());
        c.setOrdemExibicao(dto.ordemExibicao());
    }
}
