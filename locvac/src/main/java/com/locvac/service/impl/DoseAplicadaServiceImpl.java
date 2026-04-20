package com.locvac.service.impl;

import com.locvac.dto.doseAplicada.DoseAplicadaRequestDTO;
import com.locvac.dto.doseAplicada.DoseAplicadaResponseDTO;
import com.locvac.dto.doseAplicada.OutraVacinaRequestDTO;
import com.locvac.mapper.DoseAplicadaMapper;
import com.locvac.model.associacao.DoseAplicada;
import com.locvac.model.core.Pessoa;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.repository.DoseAplicadaRepository;
import com.locvac.repository.PessoaRepository;
import com.locvac.repository.VacinaRepository;
import com.locvac.service.DoseAplicadaService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoseAplicadaServiceImpl implements DoseAplicadaService {

    private final DoseAplicadaRepository repository;
    private final PessoaRepository pessoaRepository;
    private final VacinaRepository vacinaRepository;
    private final DoseAplicadaMapper mapper;

    public DoseAplicadaServiceImpl(DoseAplicadaRepository repository, PessoaRepository pessoaRepository,
                                   VacinaRepository vacinaRepository, DoseAplicadaMapper mapper) {
        this.repository = repository;
        this.pessoaRepository = pessoaRepository;
        this.vacinaRepository = vacinaRepository;
        this.mapper = mapper;
    }

    @Override
    public DoseAplicadaResponseDTO registrar(DoseAplicadaRequestDTO dto) {
        validarPessoa(dto.idPessoa());
        validarVacina(dto.idVacina());
        DoseAplicada dose = mapper.toEntity(dto);
        return mapper.toResponse(repository.save(dose));
    }

    @Override
    public DoseAplicadaResponseDTO atualizar(Long idDose, DoseAplicadaRequestDTO dto) {
        DoseAplicada dose = repository.findById(idDose)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dose não encontrada"));
        dose.setDataAplicacao(dto.dataAplicacao());
        dose.setLote(dto.lote());
        dose.setObservacao(dto.observacao());
        dose.setNomeProfissional(dto.nomeProfissional());
        dose.setRegistroProfissional(dto.registroProfissional());
        dose.setUnidadeSaude(dto.unidadeSaude());
        return mapper.toResponse(repository.save(dose));
    }

    @Override
    public void deletar(Long idDose) {
        if (!repository.existsById(idDose)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dose não encontrada");
        }
        repository.deleteById(idDose);
    }

    @Override
    public List<DoseAplicadaResponseDTO> listarPorPessoa(Long idPessoa) {
        return repository.findByPessoaId(idPessoa).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public List<DoseAplicadaResponseDTO> listarPorPessoaETipo(Long idPessoa, TipoSecaoVacinacao tipo) {
        return repository.findByPessoaIdAndVacinaTipoSecaoVacinacao(idPessoa, tipo).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public DoseAplicadaResponseDTO registrarOutraVacina(OutraVacinaRequestDTO dto) {
        validarPessoa(dto.idPessoa());
        DoseAplicada dose = new DoseAplicada();
        dose.setPessoa(new Pessoa(dto.idPessoa()));
        dose.setNomeCustom(dto.nomeVacina());
        dose.setDoseNumero(1);
        dose.setDataAplicacao(dto.dataAplicacao() != null ? dto.dataAplicacao() : LocalDate.now());
        dose.setLote(dto.lote());
        dose.setObservacao(dto.observacao());
        dose.setNomeProfissional(dto.nomeProfissional());
        dose.setRegistroProfissional(dto.registroProfissional());
        dose.setUnidadeSaude(dto.unidadeSaude());
        dose.setDataRegistro(LocalDate.now());
        return mapper.toResponse(repository.save(dose));
    }

    @Override
    public DoseAplicadaResponseDTO atualizarOutraVacina(Long idDose, OutraVacinaRequestDTO dto) {
        DoseAplicada dose = repository.findById(idDose)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dose não encontrada"));
        dose.setNomeCustom(dto.nomeVacina());
        dose.setDataAplicacao(dto.dataAplicacao() != null ? dto.dataAplicacao() : dose.getDataAplicacao());
        dose.setLote(dto.lote());
        dose.setObservacao(dto.observacao());
        dose.setNomeProfissional(dto.nomeProfissional());
        dose.setRegistroProfissional(dto.registroProfissional());
        dose.setUnidadeSaude(dto.unidadeSaude());
        return mapper.toResponse(repository.save(dose));
    }

    private void validarPessoa(Long idPessoa) {
        if (!pessoaRepository.existsById(idPessoa)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada");
        }
    }

    private void validarVacina(Long idVacina) {
        if (!vacinaRepository.existsById(idVacina)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vacina não encontrada");
        }
    }
}
