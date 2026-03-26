
package com.locvac.dto.usuarioPessoa;

import java.time.LocalDate;
import java.util.UUID;

public record UsuarioPessoaResponseDTO(
    Long id,
    UUID idUsuario,
    Long idPessoa,
    String tipoVinculo,
    boolean podeVisualizar,
    boolean podeEditar,
    LocalDate dataVinculo
) {}
