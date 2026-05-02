package com.locvac.mapper;

import com.locvac.dto.vacina.VacinaRequestDTO;
import com.locvac.dto.vacina.VacinaResponseDTO;
import com.locvac.model.core.Vacina;
import org.springframework.stereotype.Component;

@Component
public class VacinaMapper {

    public Vacina toEntity(VacinaRequestDTO dto) {
        Vacina vacina = new Vacina();
        vacina.setNome(dto.getNome());
        vacina.setDescricao(dto.getDescricao());
        vacina.setDose(dto.getDose());
        vacina.setViaAdministracao(dto.getViaAdministracao());
        vacina.setCodigoPNI(dto.getCodigoPNI());
        vacina.setTipoSecaoVacinacao(dto.getTipoSecaoVacinacao());
        vacina.setIdadeMinimaMeses(dto.getIdadeMinimaMeses());
        vacina.setIdadeMaximaMeses(dto.getIdadeMaximaMeses());
        return vacina;
    }

    public VacinaResponseDTO toResponse(Vacina vacina) {
        return new VacinaResponseDTO(
                vacina.getId(),
                vacina.getNome(),
                vacina.getDescricao(),
                vacina.getDose(),
                vacina.getCodigoPNI(),
                vacina.getTipoSecaoVacinacao(),
                vacina.getIdadeMinimaMeses(),
                vacina.getIdadeMaximaMeses()
        );
    }
}
