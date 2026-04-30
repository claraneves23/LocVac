package com.locvac.service;

import java.util.List;
import java.util.Map;

public interface ExpoPushService {
    void enviar(List<String> tokens, String titulo, String mensagem, Map<String, Object> dados);
}
