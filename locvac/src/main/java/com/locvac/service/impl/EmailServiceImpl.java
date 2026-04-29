package com.locvac.service.impl;

import com.locvac.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;
    private final String apiKey;
    private final String from;
    private final String fromName;

    public EmailServiceImpl(
            @Value("${brevo.api-key}") String apiKey,
            @Value("${mail.from}") String from,
            @Value("${mail.from-name:LocVac}") String fromName
    ) {
        this.apiKey = apiKey;
        this.from = from;
        this.fromName = fromName;
        this.restClient = RestClient.builder()
                .baseUrl(BREVO_API_URL)
                .build();
    }

    @Override
    public void enviarCodigoVerificacao(String destinatario, String codigo) {
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", fromName, "email", from),
                "to", List.of(Map.of("email", destinatario)),
                "subject", "LocVac - Código de verificação",
                "htmlContent", montarCorpo(codigo)
        );

        try {
            restClient.post()
                    .header("api-key", apiKey)
                    .header("accept", "application/json")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new RuntimeException("Falha ao enviar email de verificação.", e);
        }
    }

    private String montarCorpo(String codigo) {
        return """
                <html>
                  <body style="font-family: Arial, sans-serif; background:#CAE3E2; padding:24px;">
                    <div style="max-width:480px; margin:0 auto; background:#fff; border-radius:12px; padding:32px; text-align:center;">
                      <h2 style="color:#29442d; margin-top:0;">Confirme seu cadastro</h2>
                      <p style="color:#1f3322; font-size:14px;">
                        Use o código abaixo para confirmar seu e-mail no LocVac.
                      </p>
                      <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#29442d; margin:24px 0; padding:16px; background:#F2F7F6; border-radius:10px;">
                        %s
                      </div>
                      <p style="color:#607367; font-size:12px;">
                        O código expira em 10 minutos. Se você não solicitou este cadastro, ignore esta mensagem.
                      </p>
                    </div>
                  </body>
                </html>
                """.formatted(codigo);
    }
}
