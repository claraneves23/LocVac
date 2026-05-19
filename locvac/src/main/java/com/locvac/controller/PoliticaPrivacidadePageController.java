package com.locvac.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PoliticaPrivacidadePageController {

    @GetMapping(value = "/privacidade", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> paginaPoliticaPrivacidade() {
        return ResponseEntity.ok(HTML);
    }

    private static final String HTML = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Política de Privacidade — LocVac</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #F1F5F4; color: #1a2b27; line-height: 1.6; }
  .container { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
  header { padding-bottom: 24px; border-bottom: 1px solid #d9e3df; }
  h1 { margin: 0 0 8px; font-size: 28px; color: #03394A; }
  .sub { color: #5a6b66; font-size: 14px; margin: 0; }
  h2 { color: #03394A; font-size: 20px; margin: 36px 0 12px; }
  h3 { color: #03394A; font-size: 16px; margin: 20px 0 8px; }
  p { margin: 0 0 12px; }
  ol, ul { padding-left: 22px; }
  ol li, ul li { margin-bottom: 8px; }
  .card { background: #fff; border: 1px solid #d9e3df; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .warn { background: #fff8e1; border-color: #ffd966; }
  .info { background: #E5EEF2; border-color: #b9d0db; }
  .mono { font-family: ui-monospace, "SF Mono", Consolas, monospace; background: #eef2f1; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
  a { color: #03394A; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e1e8e6; font-size: 14px; vertical-align: top; }
  th { background: #eef4f3; color: #03394A; font-weight: 600; }
  footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #d9e3df; font-size: 13px; color: #5a6b66; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Política de Privacidade — LocVac</h1>
    <p class="sub">Caderneta de vacinação digital · Última atualização: 19 de maio de 2026</p>
  </header>

  <p>Esta Política de Privacidade descreve como o aplicativo <strong>LocVac</strong> coleta, usa, armazena e protege os dados pessoais dos seus usuários, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.</p>

  <p>Ao usar o LocVac, você concorda com as práticas descritas neste documento.</p>

  <h2>1. Quem é o controlador dos dados</h2>
  <div class="card">
    <p><strong>João Vitor Vale</strong> (desenvolvedor individual, "devvale"), responsável pelo desenvolvimento e operação do aplicativo LocVac.</p>
    <p>Contato para assuntos relacionados a privacidade e proteção de dados: <a href="mailto:contato@locvac.com.br">contato@locvac.com.br</a></p>
  </div>

  <h2>2. Dados que coletamos</h2>

  <p>Coletamos apenas os dados estritamente necessários para o funcionamento do app. Não coletamos dados de localização (GPS), navegação, hábitos de consumo ou comportamento.</p>

  <h3>2.1. Dados de cadastro e identificação</h3>
  <ul>
    <li><strong>Identificação da conta:</strong> nome, e-mail, telefone, senha (armazenada com criptografia BCrypt — nunca em texto puro).</li>
    <li><strong>Identificadores do titular e dependentes:</strong> nome, data de nascimento, CPF, CNS (Cartão Nacional de Saúde — opcional), sexo biológico.</li>
    <li><strong>Endereço:</strong> CEP, rua, complemento, município, estado.</li>
    <li><strong>Foto de perfil:</strong> opcional, fornecida pelo usuário.</li>
  </ul>

  <h3>2.2. Dados de saúde</h3>
  <ul>
    <li>Registros de vacinação (vacina, dose, data de aplicação, lote, profissional ou local de aplicação).</li>
    <li>Participações em campanhas de vacinação.</li>
  </ul>

  <h3>2.3. Dados técnicos</h3>
  <ul>
    <li>Identificador único da conta (UUID gerado pelo nosso servidor).</li>
    <li>Tokens de autenticação (JWT) e tokens de notificação push (Expo Push Token).</li>
    <li>Datas de criação da conta, tentativas de login (para prevenção de fraude) e códigos de verificação temporários (e-mail).</li>
  </ul>

  <h2>3. Para que usamos seus dados</h2>
  <table>
    <thead>
      <tr><th>Finalidade</th><th>Dados usados</th><th>Base legal (LGPD)</th></tr>
    </thead>
    <tbody>
      <tr><td>Criação e gestão da sua conta</td><td>Nome, e-mail, senha, telefone</td><td>Execução de contrato (art. 7º, V)</td></tr>
      <tr><td>Identificação no contexto do PNI (Programa Nacional de Imunizações)</td><td>CPF, CNS, data de nascimento, sexo biológico</td><td>Execução de contrato + interesse legítimo</td></tr>
      <tr><td>Registro e acompanhamento da carteira de vacinação</td><td>Dados de saúde (vacinas, doses, campanhas)</td><td>Consentimento (art. 7º, I) + proteção da saúde (art. 11, II, "f")</td></tr>
      <tr><td>Envio de lembretes e notificações sobre suas vacinas</td><td>E-mail, push token</td><td>Consentimento + execução de contrato</td></tr>
      <tr><td>Recuperação de senha e verificação de e-mail</td><td>E-mail</td><td>Execução de contrato</td></tr>
      <tr><td>Segurança da conta (bloqueio após tentativas falhas, sessões)</td><td>UUID, tentativas de login, refresh tokens</td><td>Legítimo interesse + prevenção a fraude</td></tr>
    </tbody>
  </table>

  <div class="info card">
    <strong>Não usamos seus dados para:</strong> publicidade, marketing, segmentação de anúncios, perfilamento comportamental, venda ou cessão a terceiros para fins comerciais.
  </div>

  <h2>4. Com quem compartilhamos seus dados</h2>
  <p>Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins de marketing. Compartilhamos dados apenas com <strong>operadores</strong> (na definição da LGPD) estritamente necessários para o funcionamento do aplicativo:</p>

  <table>
    <thead>
      <tr><th>Operador</th><th>Finalidade</th><th>Dados transmitidos</th></tr>
    </thead>
    <tbody>
      <tr><td>Render Inc. (EUA)</td><td>Hospedagem do servidor da API e do banco de dados PostgreSQL</td><td>Todos os dados armazenados</td></tr>
      <tr><td>Brevo (Sendinblue SAS, França)</td><td>Envio de e-mails transacionais (códigos de verificação, recuperação de senha)</td><td>E-mail e código temporário</td></tr>
      <tr><td>Google (Firebase Cloud Messaging)</td><td>Entrega de notificações push para o seu dispositivo</td><td>Token de dispositivo + conteúdo da notificação (sem dados de saúde detalhados)</td></tr>
    </tbody>
  </table>

  <p>Esses operadores tratam dados em nosso nome e estão sujeitos a obrigações contratuais e padrões internacionais de segurança e privacidade.</p>

  <h2>5. Transferência internacional de dados</h2>
  <p>Como utilizamos operadores localizados fora do Brasil (Render, Brevo e Google), seus dados podem ser tratados em servidores nos Estados Unidos e na União Europeia. Esses provedores garantem padrões de segurança equivalentes ou superiores aos exigidos pela LGPD.</p>

  <h2>6. Armazenamento e segurança</h2>
  <ul>
    <li>Senhas armazenadas com hash <strong>BCrypt</strong> (irreversível, com salt único).</li>
    <li>Comunicação cliente-servidor protegida por <strong>HTTPS/TLS</strong>.</li>
    <li>Autenticação via <strong>JWT</strong> com expiração e refresh token.</li>
    <li>Bloqueio temporário da conta após múltiplas tentativas de login mal-sucedidas.</li>
    <li>Banco de dados com acesso restrito ao desenvolvedor responsável.</li>
  </ul>

  <h2>7. Por quanto tempo guardamos seus dados</h2>
  <p>Mantemos seus dados enquanto sua conta estiver ativa. Quando você solicita a exclusão (parcial ou total), os dados são <strong>apagados imediatamente</strong> dos nossos sistemas.</p>
  <p>Backups automatizados do provedor de banco podem reter cópias por até <strong>30 dias</strong>, após os quais são definitivamente descartados. Não há acesso humano a esses backups.</p>

  <h2>8. Seus direitos (LGPD, art. 18)</h2>
  <p>Você pode, a qualquer momento:</p>
  <ul>
    <li><strong>Confirmar</strong> se tratamos seus dados.</li>
    <li><strong>Acessar</strong> seus dados (visíveis dentro do app).</li>
    <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados (editáveis no app).</li>
    <li><strong>Excluir</strong> dados ou a conta inteira (instruções abaixo).</li>
    <li><strong>Solicitar a portabilidade</strong> dos seus dados — escreva para <a href="mailto:contato@locvac.com.br">contato@locvac.com.br</a>.</li>
    <li><strong>Revogar o consentimento</strong> a qualquer momento — encerrando o uso do app ou solicitando a exclusão.</li>
    <li><strong>Apresentar reclamação</strong> à <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener">Autoridade Nacional de Proteção de Dados (ANPD)</a>.</li>
  </ul>

  <h2>9. Como excluir seus dados</h2>
  <p>Você pode excluir <strong>dados específicos</strong> (uma vacina, um dependente, uma participação em campanha) diretamente no app — basta tocar no ícone de <strong>lixeira</strong> ao lado do item.</p>
  <p>Para excluir a <strong>conta inteira</strong>, vá em <span class="mono">Perfil → Configurações → Excluir conta</span> dentro do app, ou siga as instruções completas em <a href="/excluir">locvac.com.br/excluir</a>.</p>

  <h2>10. Crianças e adolescentes</h2>
  <div class="card warn">
    <p>O LocVac é destinado a usuários <strong>maiores de 18 anos</strong>. Apenas adultos podem criar conta no aplicativo.</p>
    <p>Dados de crianças e adolescentes podem ser cadastrados como <strong>dependentes</strong>, exclusivamente sob a responsabilidade do adulto titular da conta, no melhor interesse do menor (art. 14 da LGPD), com a finalidade legítima de acompanhar a carteira de vacinação familiar.</p>
    <p>O titular adulto da conta é o responsável por inserir, manter e excluir as informações dos dependentes vinculados a ele.</p>
  </div>

  <h2>11. Notificações push</h2>
  <p>Enviamos notificações para lembrar você sobre doses pendentes e campanhas. Você pode desativá-las a qualquer momento nas configurações do seu sistema operacional, sem prejuízo das demais funções do app.</p>
  <p>Não enviamos notificações com finalidade de marketing ou promoção de terceiros.</p>

  <h2>12. Cookies e rastreadores</h2>
  <p>O LocVac é um aplicativo móvel e <strong>não utiliza cookies</strong>. Não usamos SDKs de publicidade, analytics comportamental ou rastreadores de uso.</p>

  <h2>13. Alterações nesta política</h2>
  <p>Esta política pode ser atualizada para refletir mudanças no app ou na legislação. A data da última atualização aparece no topo da página. Alterações relevantes serão comunicadas no aplicativo ou por e-mail.</p>

  <h2>14. Contato</h2>
  <p>Dúvidas, solicitações relacionadas aos seus direitos como titular de dados, ou exercício dos direitos previstos no art. 18 da LGPD: <a href="mailto:contato@locvac.com.br">contato@locvac.com.br</a></p>

  <footer>
    LocVac · Desenvolvido por João Vitor Vale (devvale) · Em conformidade com a LGPD (Lei nº 13.709/2018) · <a href="/excluir">Excluir conta e dados</a>
  </footer>
</div>
</body>
</html>
""";
}
