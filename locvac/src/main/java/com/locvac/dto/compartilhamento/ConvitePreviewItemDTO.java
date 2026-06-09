package com.locvac.dto.compartilhamento;

public record ConvitePreviewItemDTO(
        Long idPessoa,
        String nome,
        boolean jaTenhoAcesso
) {}
