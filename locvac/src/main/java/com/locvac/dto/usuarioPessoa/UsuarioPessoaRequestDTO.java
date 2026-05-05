
package com.locvac.dto.usuarioPessoa;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;
import com.locvac.model.enums.TipoVinculo;

public record UsuarioPessoaRequestDTO(
    UUID idUsuario,
    Long idPessoa,
    TipoVinculo tipoVinculo,
    @Size(max = 100) String dscParentesco,
    boolean podeVisualizar,
    boolean podeEditar,
    LocalDate dataVinculo
) {}