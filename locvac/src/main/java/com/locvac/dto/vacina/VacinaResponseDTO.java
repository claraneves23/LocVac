package com.locvac.dto.vacina;

import com.locvac.model.enums.TipoSecaoVacinacao;

public record VacinaResponseDTO(
        Long id,
        String nome,
        String descricao,
        String dose,
        String codigoPNI,
        TipoSecaoVacinacao tipoSecaoVacinacao
) {}
