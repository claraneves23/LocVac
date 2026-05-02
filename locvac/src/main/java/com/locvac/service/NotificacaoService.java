package com.locvac.service;

import com.locvac.dto.notificacao.NotificacaoResponseDTO;
import com.locvac.dto.notificacao.RegistrarTokenDTO;
import com.locvac.model.associacao.CalendarioVacinal;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface NotificacaoService {

    void notificarVacinaProxima(Pessoa pessoa, CalendarioVacinal calendario, LocalDate dataPrevista, int diasOffset);

    void notificarVacinaAtrasada(Pessoa pessoa, CalendarioVacinal calendario, LocalDate dataPrevista, int diasOffset);

    void notificarCampanha(Usuario usuario, Campanha campanha, int diasOffset);

    List<NotificacaoResponseDTO> listar(UUID usuarioId);

    void marcarComoLida(Long id, UUID usuarioId);

    void registrarToken(UUID usuarioId, RegistrarTokenDTO dto);

    void removerToken(String token);
}
