package com.locvac.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExclusaoContaPageController {

    @GetMapping(value = "/excluir-conta", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> paginaExclusaoConta() {
        return ResponseEntity.ok(HTML);
    }

    private static final String HTML = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Excluir conta — LocVac</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #F1F5F4; color: #1a2b27; line-height: 1.6; }
  .container { max-width: 720px; margin: 0 auto; padding: 32px 20px 80px; }
  header { padding-bottom: 24px; border-bottom: 1px solid #d9e3df; }
  h1 { margin: 0 0 8px; font-size: 28px; color: #03394A; }
  .sub { color: #5a6b66; font-size: 15px; margin: 0; }
  h2 { color: #03394A; font-size: 20px; margin: 32px 0 12px; }
  ol { padding-left: 22px; }
  ol li { margin-bottom: 8px; }
  ul { padding-left: 22px; }
  ul li { margin-bottom: 6px; }
  .card { background: #fff; border: 1px solid #d9e3df; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .warn { background: #fff8e1; border-color: #ffd966; }
  .mono { font-family: ui-monospace, "SF Mono", Consolas, monospace; background: #eef2f1; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
  a { color: #03394A; }
  footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #d9e3df; font-size: 13px; color: #5a6b66; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Excluir conta e dados — LocVac</h1>
    <p class="sub">Caderneta de vacinação digital · Desenvolvedor: João Vitor Vale (devvale)</p>
  </header>

  <h2>Como solicitar a exclusão</h2>
  <p>Você pode excluir sua conta e seus dados de duas formas:</p>

  <div class="card">
    <strong>1. Pelo próprio aplicativo (recomendado)</strong>
    <ol>
      <li>Abra o app LocVac e faça login.</li>
      <li>Vá em <span class="mono">Perfil → Configurações</span>.</li>
      <li>Na seção <strong>Conta</strong>, toque em <strong>Excluir conta</strong>.</li>
      <li>Confirme a ação e informe sua senha atual.</li>
      <li>A exclusão é imediata e irreversível.</li>
    </ol>
  </div>

  <div class="card">
    <strong>2. Por e-mail (se você perdeu acesso ao app)</strong>
    <ol>
      <li>Envie um e-mail para <a href="mailto:joaovitorvalec@gmail.com">joaovitorvalec@gmail.com</a> a partir do mesmo e-mail cadastrado no LocVac.</li>
      <li>Use o assunto: <span class="mono">Exclusão de conta LocVac</span>.</li>
      <li>O pedido é processado em até <strong>7 dias úteis</strong>. Você receberá uma confirmação.</li>
    </ol>
  </div>

  <h2>Dados que serão excluídos</h2>
  <p>Após a exclusão da conta, os seguintes dados são <strong>permanentemente apagados</strong> dos nossos servidores:</p>
  <ul>
    <li>Identificação da conta (nome, e-mail, telefone, senha)</li>
    <li>Dados de saúde: registros de vacinação, doses aplicadas, lotes, datas e profissionais</li>
    <li>Cadastro do titular e dos dependentes vinculados exclusivamente à sua conta (nome, data de nascimento, CPF, CNS, endereço, foto de perfil)</li>
    <li>Participações em campanhas de vacinação</li>
    <li>Notificações geradas pelo app</li>
    <li>Tokens de autenticação (sessões ativas) e tokens de notificação push</li>
    <li>Códigos de verificação de e-mail e de recuperação de senha pendentes</li>
  </ul>

  <h2>Dados retidos</h2>
  <div class="card warn">
    Nenhum dado pessoal seu é retido após a exclusão. <strong>Não mantemos backups dos seus dados de saúde</strong> além do prazo técnico de retenção do provedor de banco (até 30 dias em rotinas automatizadas de backup do provedor, sem acesso humano), após o qual os dados são definitivamente descartados.
  </div>

  <h2>Observações importantes</h2>
  <ul>
    <li>A exclusão é <strong>irreversível</strong>. Não há como recuperar a conta nem os registros de vacinação após a confirmação.</li>
    <li>Se algum dependente cadastrado também estiver vinculado a outra conta (ex.: outro responsável que também usa o LocVac), o cadastro do dependente é preservado apenas para a outra conta. Os dados de saúde compartilhados continuam acessíveis para o outro responsável.</li>
    <li>Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</li>
  </ul>

  <footer>
    LocVac · Última atualização: 18/05/2026 · Em caso de dúvida, escreva para <a href="mailto:joaovitorvalec@gmail.com">joaovitorvalec@gmail.com</a>.
  </footer>
</div>
</body>
</html>
""";
}
