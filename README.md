# 📌 LocVac – Plataforma Digital de Gestão e Acompanhamento Vacinal

O **LocVac** é uma solução tecnológica voltada para a modernização do acompanhamento vacinal. Através de uma plataforma mobile, o projeto visa centralizar informações, automatizar alertas e fornecer conteúdo confiável sobre imunização, seguindo as diretrizes do **Programa Nacional de Imunizações (PNI)**.

---

## 📖 Sobre o Projeto

O projeto surge como uma resposta à necessidade de digitalizar a tradicional carteira de vacinação física. A plataforma permite que usuários gerenciem não apenas seu próprio histórico, mas também o de seus dependentes, integrando:
- Registro digital de doses aplicadas.
- Agenda inteligente de doses futuras.
- Notificações automatizadas para evitar atrasos.
- Conteúdo técnico validado para combater a desinformação.

## 🎯 Objetivos Principais

- **Digitalização:** Organizar o histórico vacinal individual e familiar em um ambiente seguro.
- **Engajamento:** Aumentar a cobertura vacinal através de alertas e lembretes proativos.
- **Educação:** Oferecer informações técnicas sobre vacinas, contraindicações e esquemas de doses.
- **Padronização:** Estruturar dados em conformidade com as políticas públicas de saúde brasileiras.

---

## 🚀 Funcionalidades Principais

| Categoria | Descrição |
| :--- | :--- |
| **Gestão de Perfis** | Cadastro de usuários e gerenciamento completo de dependentes. |
| **Carteira Digital** | Registro histórico de todas as doses aplicadas. |
| **Agenda Inteligente** | Cálculo automático de datas para próximas doses e reforços. |
| **Alertas e Avisos** | Notificações *in-app* sobre campanhas, doses próximas ou em atraso. |
| **Central de Informação** | Guia completo sobre indicações, contraindicações e reações adversas. |
| **Auditoria e Logs** | Histórico de notificações e status de leitura para controle do usuário. |

---

## 🛠️ Tecnologias e Metodologia

### Stack Tecnológica
- **Backend:** Spring Boot (Java 17)
- **Frontend:** React Native (JavaScript)
- **Banco de Dados:** PostgreSQL
- **Design/Prototipação:** Figma

### Metodologia de Desenvolvimento
O desenvolvimento segue uma abordagem estruturada em camadas, garantindo escalabilidade e segurança:
1. **Levantamento de Requisitos:** Questionários com o público-alvo e análise do PNI.
2. **Modelagem:** Elaboração de diagramas de caso de uso, classes e banco de dados.
3. **Desenvolvimento:** Implementação paralela das camadas de banco de dados, API e interface mobile.
4. **Validação:** Testes pilotos simulando cenários reais em unidades de saúde.

---

## 📅 Cronograma de Atividades

| Atividade | 2025 (2º Sem) | 2026 (1º Sem) |
| :--- | :---: | :---: |
| Elucidação de requisitos e pesquisa bibliográfica | ✅ | |
| Análise de produtos similares e do PNI | ✅ | |
| Modelagem do sistema e Prototipação (UI/UX) | ✅ | ✅ |
| Desenvolvimento do Backend e Banco de Dados | | ✅ |
| Desenvolvimento do Frontend Mobile | | ✅ |
| Testes de pequena escala e Implementação | | ✅ |

---

## 🗄️ Modelagem do Banco de Dados

Abaixo, apresentamos a estrutura relacional do banco de dados PostgreSQL utilizada no projeto.

```mermaid
erDiagram

    %% ── Entidades principais ──────────────────────────────────────────────

    USUARIO {
        uuid    id_usuario        PK
        string  nome
        string  email
        string  senha_hash
        string  telefone
        boolean ativo
        date    data_criacao
        datetime ultimo_login
        boolean mfa_enabled
        string  mfa_secret
        int     tentativas_falhas
        datetime bloqueado_ate
    }

    PESSOA {
        bigint  id_pessoa         PK
        string  nome
        date    data_nascimento
        string  cpf
        string  sexo_biologico
        string  cns
        string  cep
        string  telefone
        string  foto_url
        string  nome_responsavel
        string  rua
        string  complemento
        string  municipio
        string  estado
        boolean ativo
    }

    VACINA {
        bigint  id_vacina         PK
        string  nome
        string  descricao
        string  dose
        string  via_administracao
        string  codigo_pni
        boolean ativa
        string  tipo_secao_vacinacao
        int     idade_minima_meses
        int     idade_maxima_meses
    }

    CAMPANHA {
        bigint  id_campanha       PK
        string  nome
        string  doenca_alvo
        date    data_inicio
        date    data_fim
        string  publico_alvo
        boolean ativa
    }

    GRUPO_RISCO {
        bigint  id_grupo_risco    PK
        string  nome
        string  descricao
    }

    CATEGORIA_VACINA {
        bigint  id_categoria      PK
        string  descricao
    }

    %% ── Autenticação e segurança ──────────────────────────────────────────

    REFRESH_TOKENS {
        uuid    id                PK
        uuid    id_usuario        FK
        string  token_hash
        datetime expires_at
        boolean revoked
        datetime created_at
    }

    EMAIL_VERIFICACAO {
        bigint  id_email_verificacao PK
        string  email
        string  senha_hash
        string  codigo_hash
        int     tentativas
        datetime expira_em
        datetime criado_em
        datetime ultimo_envio_em
    }

    RECUPERACAO_SENHA {
        bigint  id_recuperacao_senha PK
        string  email
        string  codigo_hash
        int     tentativas
        datetime expira_em
        datetime criado_em
        datetime ultimo_envio_em
    }

    %% ── Push notifications ────────────────────────────────────────────────

    EXPO_PUSH_TOKEN {
        bigint  id_token          PK
        uuid    id_usuario        FK
        string  token
        string  plataforma
        datetime criado_em
    }

    %% ── Vínculo usuário–pessoa ────────────────────────────────────────────

    USUARIO_PESSOA {
        bigint  id_usuario_pessoa PK
        uuid    id_usuario        FK
        bigint  id_pessoa         FK
        string  tipo_vinculo
        boolean pode_visualizar
        boolean pode_editar
        date    data_vinculo
        string  dsc_parentesco
    }

    %% ── Vacinação ─────────────────────────────────────────────────────────

    CALENDARIO_VACINAL {
        bigint  id_calendario     PK
        bigint  id_vacina         FK
        int     faixa_etaria_min_meses
        int     faixa_etaria_max_meses
        string  publico_alvo
        boolean obrigatoria
        string  numero_dose
        string  descricao_dose
        string  ordem_exibicao
    }

    DOSE_APLICADA {
        bigint  id_dose           PK
        bigint  id_pessoa         FK
        bigint  id_vacina         FK
        bigint  id_categoria      FK
        string  nome_custom
        int     dose_numero
        string  nome_profissional
        string  registro_profissional
        date    data_aplicacao
        string  lote
        string  observacao
        string  fabricante
        date    data_registro
        string  unidade_saude
    }

    PARTICIPACAO_CAMPANHA {
        bigint  id_participacao   PK
        bigint  id_pessoa         FK
        bigint  id_campanha       FK
        date    data_participacao
    }

    NOTIFICACAO {
        bigint  id_notificacao    PK
        uuid    id_usuario        FK
        bigint  id_pessoa         FK
        bigint  id_calendario     FK
        bigint  id_campanha       FK
        int     dias_offset
        boolean persistente
        string  titulo
        string  mensagem
        date    data_criacao
        date    data_visualizacao
        boolean lida
        string  tipo_notificacao
    }

    VACINA_EFEITO_COLATERAL {
        bigint  id_efeito_colateral PK
        bigint  id_vacina           FK
        string  descricao
        string  severidade
        string  orientacao
    }

    VACINA_INFORMATIVO {
        bigint  id_informativo    PK
        bigint  id_vacina         FK
        int     versao
        date    data_publicacao
        string  orgao_emissor
        string  fonte_referencia
    }

    VACINA_SECAO_INFORMATIVA {
        bigint  id_secao          PK
        bigint  id_informativo    FK
        string  titulo_secao
        text    conteudo
        int     ordem_exibicao
    }

    %% ── Carrossel educativo ───────────────────────────────────────────────

    CARROSSEL_ITEM {
        bigint  id_item           PK
        string  titulo
        string  descricao
        string  imagem_url
        int     ordem_exibicao
        boolean ativo
    }

    CARROSSEL_CONTEUDO {
        bigint  id_conteudo       PK
        bigint  id_item           FK
        string  titulo_secao
        text    conteudo
        int     ordem_exibicao
    }

    CARROSSEL_CONTEUDO_ITEM {
        bigint  id_conteudo       FK
        text    item
        int     ordem
    }

    %% ── Relacionamentos ───────────────────────────────────────────────────

    USUARIO             ||--o{ USUARIO_PESSOA          : "possui"
    PESSOA              ||--o{ USUARIO_PESSOA          : "vinculada em"
    USUARIO             ||--o{ REFRESH_TOKENS          : "possui"
    USUARIO             ||--o{ EXPO_PUSH_TOKEN         : "registra"
    USUARIO             ||--o{ NOTIFICACAO             : "recebe"
    PESSOA              ||--o{ DOSE_APLICADA           : "recebe"
    PESSOA              ||--o{ PARTICIPACAO_CAMPANHA   : "participa de"
    PESSOA              ||--o{ NOTIFICACAO             : "referenciada em"
    VACINA              ||--o{ CALENDARIO_VACINAL      : "compõe"
    VACINA              ||--o{ DOSE_APLICADA           : "aplicada em"
    VACINA              ||--o{ VACINA_EFEITO_COLATERAL : "possui"
    VACINA              ||--o{ VACINA_INFORMATIVO      : "possui"
    VACINA_INFORMATIVO  ||--o{ VACINA_SECAO_INFORMATIVA : "detalha"
    CAMPANHA            ||--o{ PARTICIPACAO_CAMPANHA   : "recebe"
    CAMPANHA            ||--o{ NOTIFICACAO             : "referenciada em"
    CATEGORIA_VACINA    ||--o{ DOSE_APLICADA           : "classifica"
    CALENDARIO_VACINAL  ||--o{ NOTIFICACAO             : "gera"
    CARROSSEL_ITEM      ||--o{ CARROSSEL_CONTEUDO      : "contém"
    CARROSSEL_CONTEUDO  ||--o{ CARROSSEL_CONTEUDO_ITEM : "lista"
```

---

## 👥 Equipe de Desenvolvimento

- **Anilson Goes Lima**
- **Glória Maria Pianheri**
- **João Vitor Vale da Cruz**
- **Maria Clara Pirani Neves**

## 📚 Referências Bibliográficas

- **CASCIARO, Mario; MAMMINO, Luciano.** *Node.js Design Patterns* (2020).
- **DABIT, Nader.** *React Native in Action* (2019).
- **DOMINGUES, Carla et al.** *46 anos do Programa Nacional de Imunizações* (2020).
- **YAHIAOUI, Houssem.** *Firebase Cookbook* (2017).
