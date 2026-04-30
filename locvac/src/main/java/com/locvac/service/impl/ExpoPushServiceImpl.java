package com.locvac.service.impl;

import com.locvac.service.ExpoPushService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpoPushServiceImpl implements ExpoPushService {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushServiceImpl.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private static final int BATCH_SIZE = 100;

    private final RestClient restClient = RestClient.builder()
            .baseUrl(EXPO_PUSH_URL)
            .build();

    @Override
    public void enviar(List<String> tokens, String titulo, String mensagem, Map<String, Object> dados) {
        if (tokens == null || tokens.isEmpty()) {
            return;
        }

        List<Map<String, Object>> mensagens = new ArrayList<>();
        for (String token : tokens) {
            Map<String, Object> msg = new HashMap<>();
            msg.put("to", token);
            msg.put("title", titulo);
            msg.put("body", mensagem);
            msg.put("sound", "default");
            msg.put("priority", "high");
            if (dados != null && !dados.isEmpty()) {
                msg.put("data", dados);
            }
            mensagens.add(msg);
        }

        for (int i = 0; i < mensagens.size(); i += BATCH_SIZE) {
            List<Map<String, Object>> batch = mensagens.subList(
                    i, Math.min(i + BATCH_SIZE, mensagens.size())
            );
            try {
                restClient.post()
                        .header("accept", "application/json")
                        .header("accept-encoding", "gzip, deflate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(batch)
                        .retrieve()
                        .toBodilessEntity();
            } catch (RestClientException e) {
                log.warn("Falha ao enviar push para batch de {} tokens: {}", batch.size(), e.getMessage());
            }
        }
    }
}
