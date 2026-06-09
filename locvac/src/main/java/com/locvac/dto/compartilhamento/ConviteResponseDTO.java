package com.locvac.dto.compartilhamento;

import java.time.LocalDateTime;
import java.util.List;

public record ConviteResponseDTO(
        String token,
        String codigo,
        String deepLink,
        LocalDateTime expiraEm,
        List<String> pessoasNomes
) {}
