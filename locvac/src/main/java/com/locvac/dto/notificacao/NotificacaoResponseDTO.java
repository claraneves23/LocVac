package com.locvac.dto.notificacao;

import com.locvac.model.enums.TipoNotificacao;

import java.time.LocalDate;

public record NotificacaoResponseDTO(
        Long id,
        TipoNotificacao tipo,
        String titulo,
        String mensagem,
        Integer diasOffset,
        boolean lida,
        boolean persistente,
        LocalDate dataCriacao,
        Long calendarioId,
        Long pessoaId,
        Long campanhaId
) {}
