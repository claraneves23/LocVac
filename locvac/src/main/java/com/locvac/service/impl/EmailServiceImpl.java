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
        enviar(destinatario, "LocVac - Código de verificação",
                montarCorpo("Confirme seu cadastro",
                        "Use o código abaixo para confirmar seu e-mail no LocVac.",
                        "Se você não solicitou este cadastro, ignore esta mensagem.",
                        codigo));
    }

    @Override
    public void enviarCodigoRecuperacaoSenha(String destinatario, String codigo) {
        enviar(destinatario, "LocVac - Recuperação de senha",
                montarCorpo("Recuperação de senha",
                        "Use o código abaixo para redefinir sua senha no LocVac.",
                        "Se você não solicitou esta redefinição, ignore esta mensagem.",
                        codigo));
    }

    private void enviar(String destinatario, String assunto, String html) {
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", fromName, "email", from),
                "to", List.of(Map.of("email", destinatario)),
                "subject", assunto,
                "htmlContent", html
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
            throw new RuntimeException("Falha ao enviar email.", e);
        }
    }

    private String montarCorpo(String titulo, String chamada, String aviso, String codigo) {
        return """
                <html>
                  <body style="font-family: Arial, sans-serif; background:#CAE3E2; padding:24px;">
                    <div style="max-width:480px; margin:0 auto; background:#fff; border-radius:12px; padding:32px; text-align:center;">
                      <h2 style="color:#29442d; margin-top:0;">%s</h2>
                      <p style="color:#1f3322; font-size:14px;">
                        %s
                      </p>
                      <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#29442d; margin:24px 0; padding:16px; background:#F2F7F6; border-radius:10px;">
                        %s
                      </div>
                      <p style="color:#607367; font-size:12px;">
                        O código expira em 10 minutos. %s
                      </p>
                    </div>
                  </body>
                </html>
                """.formatted(titulo, chamada, codigo, aviso);
    }
}
