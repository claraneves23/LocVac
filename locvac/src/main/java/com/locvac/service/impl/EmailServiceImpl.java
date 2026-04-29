package com.locvac.service.impl;

import com.locvac.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${mail.from}") String from,
            @Value("${mail.from-name:LocVac}") String fromName
    ) {
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void enviarCodigoVerificacao(String destinatario, String codigo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(new InternetAddress(from, fromName));
            helper.setTo(destinatario);
            helper.setSubject("LocVac - Código de verificação");
            helper.setText(montarCorpo(codigo), true);

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
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
