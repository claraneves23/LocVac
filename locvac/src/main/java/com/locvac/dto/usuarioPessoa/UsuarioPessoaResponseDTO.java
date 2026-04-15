
package com.locvac.dto.usuarioPessoa;

import java.time.LocalDate;
import java.util.UUID;
import com.locvac.model.enums.TipoVinculo;

public record UsuarioPessoaResponseDTO(
    Long id,
    UUID idUsuario,
    Long idPessoa,
    TipoVinculo tipoVinculo,
    String dscParentesco,
    boolean podeVisualizar,
    boolean podeEditar,
    LocalDate dataVinculo
) {}