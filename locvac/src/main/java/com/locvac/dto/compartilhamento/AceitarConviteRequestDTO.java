package com.locvac.dto.compartilhamento;

import java.util.Map;

/**
 * Corpo (opcional) do aceite de convite. Mapeia o id da pessoa ao parentesco
 * escolhido por quem está aceitando — cada usuário define o próprio parentesco.
 */
public record AceitarConviteRequestDTO(Map<Long, String> parentescos) {}
