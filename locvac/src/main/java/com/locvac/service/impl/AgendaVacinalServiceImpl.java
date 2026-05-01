package com.locvac.service.impl;

import com.locvac.dto.agendaVacinal.AgendaVacinalRequestDTO;
import com.locvac.dto.agendaVacinal.AgendaVacinalResponseDTO;
import com.locvac.mapper.AgendaVacinalMapper;
import com.locvac.model.associacao.AgendaVacinal;
import com.locvac.model.associacao.CalendarioVacinal;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Vacina;
import com.locvac.repository.AgendaVacinalRepository;
import com.locvac.repository.CalendarioVacinalRepository;
import com.locvac.repository.CampanhaRepository;
import com.locvac.repository.PessoaRepository;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.AgendaVacinalService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class AgendaVacinalServiceImpl implements AgendaVacinalService {

    private final AgendaVacinalRepository repository;
    private final PessoaRepository pessoaRepository;
    private final VacinaRepository vacinaRepository;
    private final CalendarioVacinalRepository calendarioRepository;
    private final CampanhaRepository campanhaRepository;
    private final AgendaVacinalMapper mapper;

    public AgendaVacinalServiceImpl(
            AgendaVacinalRepository repository,
            PessoaRepository pessoaRepository,
            VacinaRepository vacinaRepository,
            CalendarioVacinalRepository calendarioRepository,
            CampanhaRepository campanhaRepository,
            AgendaVacinalMapper mapper
    ) {
        this.repository = repository;
        this.pessoaRepository = pessoaRepository;
        this.vacinaRepository = vacinaRepository;
        this.calendarioRepository = calendarioRepository;
        this.campanhaRepository = campanhaRepository;
        this.mapper = mapper;
    }

    @Override
    public AgendaVacinalResponseDTO criar(AgendaVacinalRequestDTO dto) {
        AgendaVacinal a = new AgendaVacinal();
        aplicar(a, dto);
        return mapper.toResponse(repository.save(a));
    }

    @Override
    public List<AgendaVacinalResponseDTO> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public List<AgendaVacinalResponseDTO> listarPorPessoa(Long idPessoa) {
        return repository.findByPessoaId(idPessoa).stream().map(mapper::toResponse).toList();
    }

    @Override
    public AgendaVacinalResponseDTO buscarPorId(Long id) {
        return mapper.toResponse(buscar(id));
    }

    @Override
    public AgendaVacinalResponseDTO atualizar(Long id, AgendaVacinalRequestDTO dto) {
        AgendaVacinal a = buscar(id);
        aplicar(a, dto);
        return mapper.toResponse(repository.save(a));
    }

    @Override
    public void remover(Long id) {
        AgendaVacinal a = buscar(id);
        repository.delete(a);
    }

    private AgendaVacinal buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda não encontrada."));
    }

    private void aplicar(AgendaVacinal a, AgendaVacinalRequestDTO dto) {
        Pessoa pessoa = pessoaRepository.findById(dto.idPessoa())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pessoa não encontrada."));
        Vacina vacina = vacinaRepository.findById(dto.idVacina())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vacina não encontrada."));
        CalendarioVacinal calendario = calendarioRepository.findById(dto.idCalendario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calendário não encontrado."));

        Campanha campanha = null;
        if (dto.idCampanha() != null) {
            campanha = campanhaRepository.findById(dto.idCampanha())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campanha não encontrada."));
        }

        a.setPessoa(pessoa);
        a.setVacina(vacina);
        a.setCalendario(calendario);
        a.setCampanha(campanha);
        a.setDataPrevista(dto.dataPrevista());
        a.setStatus(dto.status());
    }
}
