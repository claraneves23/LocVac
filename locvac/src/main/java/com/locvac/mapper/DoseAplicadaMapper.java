package com.locvac.mapper;

import com.locvac.dto.doseAplicada.DoseAplicadaRequestDTO;
import com.locvac.dto.doseAplicada.DoseAplicadaResponseDTO;
import com.locvac.model.associacao.DoseAplicada;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Vacina;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DoseAplicadaMapper {

    public DoseAplicada toEntity(DoseAplicadaRequestDTO dto) {
        DoseAplicada dose = new DoseAplicada();
        dose.setPessoa(new Pessoa(dto.idPessoa()));
        dose.setVacina(new Vacina(dto.idVacina()));
        dose.setDoseNumero(1);
        dose.setDataAplicacao(dto.dataAplicacao() != null ? dto.dataAplicacao() : LocalDate.now());
        dose.setLote(dto.lote());
        dose.setObservacao(dto.observacao());
        dose.setNomeProfissional(dto.nomeProfissional());
        dose.setRegistroProfissional(dto.registroProfissional());
        dose.setUnidadeSaude(dto.unidadeSaude());
        dose.setDataRegistro(LocalDate.now());
        return dose;
    }

    public DoseAplicadaResponseDTO toResponse(DoseAplicada dose) {
        return new DoseAplicadaResponseDTO(
                dose.getId(),
                dose.getPessoa().getId(),
                dose.getVacina().getId(),
                dose.getVacina().getNome(),
                dose.getDataAplicacao(),
                dose.getLote(),
                dose.getObservacao(),
                dose.getNomeProfissional(),
                dose.getRegistroProfissional(),
                dose.getUnidadeSaude()
        );
    }
}
