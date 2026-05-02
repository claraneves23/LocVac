package com.locvac.service;

public interface EmailService {

    void enviarCodigoVerificacao(String destinatario, String codigo);

    void enviarCodigoRecuperacaoSenha(String destinatario, String codigo);
}
