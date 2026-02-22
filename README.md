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
    USUARIO {
        string id_usuario PK
        string nome
        string email
        string senha_hash
        string telefone
        boolean ativo
        datetime data_criacao
        datetime ultimo_login
    }

    PESSOA {
        string id_pessoa PK
        string nome
        date data_nascimento
        string sexo
        string cpf
        string cns
        string nome_mae
        boolean ativo
    }

    CAMPANHA {
        string id_campanha PK
        string nome
        string doenca_alvo
        date data_inicio
        date data_fim
        string publico_alvo
        boolean ativa
    }

    UNIDADE_SAUDE {
        string id_unidade PK
        string nome
        string cnes
        string endereco
        string municipio
        string estado
        string telefone
        string email
        string descricao
        boolean ativa
    }

    VACINA {
        string id_vacina PK
        string nome
        string fabricante
        string tipo
        string via_administracao
        string codigo_pni
        boolean ativa
    }

    CATEGORIA_VACINA {
        string id_categoria PK
        string descricao
    }

    LOG_AUDITORIA {
        string id_log PK
        string entidade
        string id_entidade
        string acao
        string id_usuario FK
        datetime data_hora
        jsonb dados_anteriores
        jsonb dados_novos
    }

    USUARIO_PESSOA {
        string id_usuario_pessoa PK
        string id_usuario FK
        string id_pessoa FK
        string tipo_vinculo
        boolean pode_visualizar
        boolean pode_editar
        datetime data_vinculo
    }

    AGENDA_VACINAL {
        string id_agenda PK
        string id_pessoa FK
        string id_vacina FK
        string id_calendario FK
        string id_campanha FK
        date data_prevista
        string tipo_evento
        string status
    }

    DOSE_APLICADA {
        string id_dose PK
        string id_pessoa FK
        string id_vacina FK
        string id_categoria FK
        string id_campanha FK
        int dose_numero
        date data_aplicacao
        string lote
        string id_unidade FK
        string observacao
        string criada_por FK
        datetime data_registro
    }

    VACINA_INFORMATIVO {
        string id_informativo PK
        string id_vacina FK
        int versao
        datetime data_publicacao
        string orgao_emissor
        string fonte_referencia
        boolean ativa
    }

    CALENDARIO_VACINAL {
        string id_calendario PK
        string id_vacina FK
        string id_categoria FK
        int faixa_etaria_min_meses
        int faixa_etaria_max_meses
        string publico_alvo
        boolean obrigatoria
    }

    NOTIFICACAO {
        string id_notificacao PK
        string id_usuario FK
        string id_pessoa FK
        string id_agenda FK
        string titulo
        string mensagem
        datetime data_criacao
        datetime data_visualizacao
        boolean lida
        string tipo
    }

    VACINA_SECAO_INFORMATIVA {
        string id_secao PK
        string id_informativo FK
        string titulo_secao
        string conteudo
        int ordem_exibicao
    }

    USUARIO ||--o{ USUARIO_PESSOA : "possui"
    PESSOA ||--o{ USUARIO_PESSOA : "vinculada"
    USUARIO ||--o{ LOG_AUDITORIA : "gera"
    PESSOA ||--o{ AGENDA_VACINAL : "tem"
    PESSOA ||--o{ DOSE_APLICADA : "recebe"
    PESSOA ||--o{ NOTIFICACAO : "recebe"
    VACINA ||--o{ AGENDA_VACINAL : "agendada"
    VACINA ||--o{ DOSE_APLICADA : "aplicada"
    VACINA ||--o{ VACINA_INFORMATIVO : "possui"
    VACINA ||--o{ CALENDARIO_VACINAL : "pertence"
    CATEGORIA_VACINA ||--o{ DOSE_APLICADA : "classifica"
    CATEGORIA_VACINA ||--o{ CALENDARIO_VACINAL : "organiza"
    CAMPANHA ||--o{ AGENDA_VACINAL : "promove"
    CAMPANHA ||--o{ DOSE_APLICADA : "registra"
    UNIDADE_SAUDE ||--o{ DOSE_APLICADA : "realiza"
    VACINA_INFORMATIVO ||--o{ VACINA_SECAO_INFORMATIVA : "detalha"
    AGENDA_VACINAL ||--o{ NOTIFICACAO : "gera"
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
