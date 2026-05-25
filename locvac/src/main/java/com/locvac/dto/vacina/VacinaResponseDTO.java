package com.locvac.dto.vacina;

import com.locvac.model.enums.TipoDose;
import com.locvac.model.enums.TipoSecaoVacinacao;

import java.util.List;

public record VacinaResponseDTO(
        Long id,
        String nome,
        String descricao,
        String dose,
        String codigoPNI,
        TipoSecaoVacinacao tipoSecaoVacinacao,
        Integer idadeMinimaMeses,
        Integer idadeMaximaMeses,
        Integer numeroDose,
        TipoDose tipoDose,
        List<Long> gruposRiscoIds
) {}
