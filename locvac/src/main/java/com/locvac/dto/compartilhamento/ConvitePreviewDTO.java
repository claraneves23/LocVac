package com.locvac.dto.compartilhamento;

import java.time.LocalDateTime;
import java.util.List;

public record ConvitePreviewDTO(
        List<ConvitePreviewItemDTO> dependentes,
        String compartilhadoPorNome,
        boolean podeEditar,
        LocalDateTime expiraEm
) {}
