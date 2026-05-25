-- ============================================================
-- Seed: Vacinas do Calendario Nacional de Vacinacao (PNI)
-- Organizadas pelos 5 grupos oficiais do site gov.br:
--   GESTANTE, CRIANCA, ADOLESCENTE_JOVEM, ADULTO, IDOSO
-- Fonte: https://www.gov.br/saude/pt-br/vacinacao/calendario
-- Atualizado em: 2026-05-21
-- ============================================================
-- Como rodar:
--   psql "$DATABASE_URL" -f locvac/src/main/resources/db/seed_vacinas_pni.sql
--
-- Idempotente: o DELETE no inicio remove inserts anteriores
-- deste mesmo seed (pelos prefixos de codigo_pni) e reinsere
-- tudo.
--
-- Codigos de vacina:
--   Sufixo _GEST = Gestante
--   Sufixo _CRI  = Crianca
--   Sufixo _ADO  = Adolescente e Jovem
--   Sufixo _ADU  = Adulto
--   Sufixo _IDO  = Idoso
-- ============================================================

BEGIN;

-- ============================================================
-- 0a. CHECK CONSTRAINT do enum: dropar a antiga (com 3 valores)
-- ============================================================
-- O Hibernate (ddl-auto=update) NAO atualiza CHECK constraints
-- quando os valores do enum mudam. A constraint antiga ainda
-- exige 'OBRIGATORIAS_PRIMEIRO_ANO'/'OUTRAS_VACINAS'/'CAMPANHAS',
-- bloqueando os novos valores. Dropamos aqui e recriamos no
-- final do seed com os 5 valores novos.

ALTER TABLE vacina DROP CONSTRAINT IF EXISTS vacina_tipo_secao_vacinacao_check;

-- ============================================================
-- 0b. MIGRACAO: valores antigos do enum TipoSecaoVacinacao
-- ============================================================
-- Atualiza vacinas pre-existentes que estao salvas com
-- OBRIGATORIAS_PRIMEIRO_ANO / OUTRAS_VACINAS / CAMPANHAS para os
-- novos valores GESTANTE/CRIANCA/ADO_JOVEM/ADULTO/IDOSO.

UPDATE vacina SET tipo_secao_vacinacao = 'CRIANCA'
 WHERE tipo_secao_vacinacao = 'OBRIGATORIAS_PRIMEIRO_ANO';

UPDATE vacina SET tipo_secao_vacinacao = 'CRIANCA'
 WHERE tipo_secao_vacinacao = 'OUTRAS_VACINAS';

UPDATE vacina SET tipo_secao_vacinacao = 'CRIANCA'
 WHERE tipo_secao_vacinacao = 'CAMPANHAS';

-- ============================================================
-- 0c. LIMPEZA: remove dados de execucoes anteriores deste seed
-- ============================================================

DELETE FROM vacina_secao_informativa
 WHERE id_informativo IN (
   SELECT i.id_informativo FROM vacina_informativo i
   JOIN vacina v ON v.id_vacina = i.id_vacina
   WHERE v.codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$'
      OR v.codigo_pni IN ('BCG','HEPB','PENTA','VIP','PNEUMO10','ROTAV','MENINGOC','INFLU','FA','MENACWY','TVIRAL','COVID19PED')
 );

DELETE FROM vacina_informativo
 WHERE id_vacina IN (
   SELECT id_vacina FROM vacina
   WHERE codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$'
      OR codigo_pni IN ('BCG','HEPB','PENTA','VIP','PNEUMO10','ROTAV','MENINGOC','INFLU','FA','MENACWY','TVIRAL','COVID19PED')
 );

DELETE FROM calendario_vacinal
 WHERE id_vacina IN (
   SELECT id_vacina FROM vacina
   WHERE codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$'
      OR codigo_pni IN ('BCG','HEPB','PENTA','VIP','PNEUMO10','ROTAV','MENINGOC','INFLU','FA','MENACWY','TVIRAL','COVID19PED')
 );

DELETE FROM vacina_efeito_colateral
 WHERE id_vacina IN (
   SELECT id_vacina FROM vacina
   WHERE codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$'
      OR codigo_pni IN ('BCG','HEPB','PENTA','VIP','PNEUMO10','ROTAV','MENINGOC','INFLU','FA','MENACWY','TVIRAL','COVID19PED')
 );

DELETE FROM vacina
 WHERE codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$'
    OR codigo_pni IN ('BCG','HEPB','PENTA','VIP','PNEUMO10','ROTAV','MENINGOC','INFLU','FA','MENACWY','TVIRAL','COVID19PED');


-- ============================================================
-- 1. VACINAS (48 linhas, uma por par vacina x grupo)
-- Faixas etarias em meses (idade_minima/maxima_meses):
--   GESTANTE          -> 180 a 599  (15 a 49 anos, periodo reprodutivo)
--   CRIANCA           -> 0   a 119  (0 a 9 anos, 11 meses, 29 dias)
--   ADOLESCENTE_JOVEM -> 120 a 299  (10 a 24 anos, 11 meses, 29 dias)
--   ADULTO            -> 300 a 719  (25 a 59 anos)
--   IDOSO             -> 720 a NULL (a partir de 60 anos)
-- ============================================================

INSERT INTO vacina (nome, descricao, dose, via_administracao, codigo_pni, ativa, tipo_secao_vacinacao, idade_minima_meses, idade_maxima_meses) VALUES
-- ----- GESTANTE -----
('Hepatite B', 'Vacina contra o virus da hepatite B. Para gestantes sem esquema completo: aplicar 3 doses ao saber da gravidez conforme historico vacinal.', '0,5 mL', 'Intramuscular', 'HEPB_GEST', TRUE, 'GESTANTE', 180, 599),
('dT (Dupla Adulto)', 'Vacina contra difteria e tetano. Aplicar 3 doses ao saber da gravidez conforme historico vacinal; reforco a cada 10 anos (antecipado para 5 anos em situacoes de risco).', '0,5 mL', 'Intramuscular', 'DT_GEST', TRUE, 'GESTANTE', 180, 599),
('Influenza Trivalente', 'Vacina contra a gripe. Aplicar 1 dose por temporada ao saber da gravidez. Protege a gestante e o bebe nos primeiros meses de vida.', '0,5 mL', 'Intramuscular', 'INFLU_GEST', TRUE, 'GESTANTE', 180, 599),
('Covid-19', 'Vacina contra formas graves e obitos por SARS-CoV-2. Aplicar 1 dose a cada gestacao.', '0,3 mL ou 0,5 mL (varia por fabricante)', 'Intramuscular', 'COVID19_GEST', TRUE, 'GESTANTE', 180, 599),
('Febre Amarela', 'Vacina contra a febre amarela. Em gestantes, somente em situacoes excepcionais (residentes ou viajantes em areas de risco com transmissao ativa), apos avaliacao individual de risco-beneficio.', '0,5 mL', 'Subcutanea', 'FA_GEST', TRUE, 'GESTANTE', 180, 599),
('dTpa (Triplice Acelular)', 'Vacina contra difteria, tetano e coqueluche. Aplicar 1 dose por gestacao a partir da 20a semana, para proteger o bebe contra coqueluche nos primeiros dias de vida.', '0,5 mL', 'Intramuscular', 'DTPA_GEST', TRUE, 'GESTANTE', 180, 599),
('VVSR (Virus Sincicial Respiratorio)', 'Vacina contra o virus sincicial respiratorio. Aplicar 1 dose por gestacao a partir da 28a semana; protege o bebe contra bronquiolite e pneumonia nos primeiros meses.', '0,5 mL', 'Intramuscular', 'VVSR_GEST', TRUE, 'GESTANTE', 180, 599),

-- ----- CRIANCA -----
('BCG', 'Vacina contra a tuberculose, em especial as formas graves (miliar e meningea). Aplicada na maternidade ao nascer.', '0,1 mL', 'Intradermica', 'BCG_CRI', TRUE, 'CRIANCA', 0, 119),
('Hepatite B', 'Vacina contra o virus da hepatite B. Primeira dose nas primeiras 12 horas de vida; doses seguintes integram a Penta aos 2, 4 e 6 meses.', '0,5 mL', 'Intramuscular', 'HEPB_CRI', TRUE, 'CRIANCA', 0, 119),
('Penta (DTP+Hib+HB)', 'Pentavalente: protege contra difteria, tetano, coqueluche, Haemophilus influenzae B e hepatite B. Aplicada aos 2, 4 e 6 meses.', '0,5 mL', 'Intramuscular', 'PENTA_CRI', TRUE, 'CRIANCA', 2, 119),
('VIP (Poliomielite Inativada)', 'Vacina inativada contra a paralisia infantil. Aplicada aos 2, 4 e 6 meses; reforcos aos 15 meses e aos 4 anos.', '0,5 mL', 'Intramuscular', 'VIP_CRI', TRUE, 'CRIANCA', 2, 119),
('Pneumococica 10-valente', 'Protege contra doencas invasivas (meningite, pneumonia, sepse) por dez sorotipos do pneumococo. Aplicada aos 2 e 4 meses com reforco aos 12 meses.', '0,5 mL', 'Intramuscular', 'PNEUMO10_CRI', TRUE, 'CRIANCA', 2, 119),
('Rotavirus Humano', 'Vacina oral contra a gastroenterite grave por rotavirus. 1a dose entre 1m15d e 3m15d; 2a dose entre 3m15d e 7m29d (prazos improrrogaveis).', '1,5 mL', 'Oral', 'ROTAV_CRI', TRUE, 'CRIANCA', 1, 7),
('Meningococica C (Conjugada)', 'Vacina conjugada contra a doenca meningococica pelo sorogrupo C. Aplicada aos 3 e 5 meses.', '0,5 mL', 'Intramuscular', 'MENINGOC_CRI', TRUE, 'CRIANCA', 3, 119),
('Influenza Trivalente', 'Vacina contra a gripe sazonal. Criancas de 6m a <6 anos: vacinacao anual; primovacinacao requer 2 doses com 30 dias de intervalo.', '0,25 mL (6m a 3a) ou 0,5 mL (>= 3a)', 'Intramuscular', 'INFLU_CRI', TRUE, 'CRIANCA', 6, 119),
('Covid-19 (pediatrica)', 'Vacina contra formas graves e obitos por SARS-CoV-2. A partir dos 6 meses; esquema completo varia por fabricante (2 ou 3 doses). Imunocomprometidas: 3 doses + reforco semestral ate 4 anos.', '0,25 mL ou 0,3 mL', 'Intramuscular', 'COVID19_CRI', TRUE, 'CRIANCA', 6, 119),
('Febre Amarela', 'Vacina contra a febre amarela. 1a dose aos 9 meses; reforco aos 4 anos. Em areas de transmissao ativa, dose excepcional pode ser feita entre 6 e 8 meses.', '0,5 mL', 'Subcutanea', 'FA_CRI', TRUE, 'CRIANCA', 6, 119),
('Meningococica ACWY', 'Vacina conjugada contra sorogrupos A, C, W e Y do meningococo. Reforco aos 12 meses (substituiu o reforco da Meningo C).', '0,5 mL', 'Intramuscular', 'MENACWY_CRI', TRUE, 'CRIANCA', 12, 119),
('Triplice Viral (SCR)', 'Vacina contra sarampo, caxumba e rubeola. 1a dose aos 12 meses; 2a dose aos 15 meses (como Tetra Viral se houver varicela em coadministracao).', '0,5 mL', 'Subcutanea', 'TVIRAL_CRI', TRUE, 'CRIANCA', 12, 119),
('DTP (Triplice Bacteriana)', 'Vacina contra difteria, tetano e coqueluche. 1o reforco aos 15 meses e 2o reforco aos 4 anos.', '0,5 mL', 'Intramuscular', 'DTP_CRI', TRUE, 'CRIANCA', 15, 119),
('Varicela', 'Vacina contra catapora. 1a dose aos 15 meses (Tetra Viral) e 2a dose aos 4 anos.', '0,5 mL', 'Subcutanea', 'VARICELA_CRI', TRUE, 'CRIANCA', 15, 119),
('Hepatite A', 'Vacina contra o virus da hepatite A. Dose unica aos 15 meses.', '0,5 mL', 'Intramuscular', 'HEPA_CRI', TRUE, 'CRIANCA', 15, 119),
('Pneumococica 23-valente', 'Vacina polissacaridica contra 23 sorotipos do pneumococo. Indicada para povos indigenas a partir dos 5 anos sem historico de pneumo conjugada; 2 doses com intervalo de 5 anos.', '0,5 mL', 'Intramuscular', 'PNEUMO23_CRI', TRUE, 'CRIANCA', 60, 119),
('dT (Dupla Adulto)', 'Vacina contra difteria e tetano para completar esquema em criancas com vacinacao em atraso a partir dos 7 anos.', '0,5 mL', 'Intramuscular', 'DT_CRI', TRUE, 'CRIANCA', 84, 119),
('HPV4 (Quadrivalente)', 'Vacina quadrivalente contra o papilomavirus humano. Dose unica entre 9 e 14 anos, para ambos os sexos.', '0,5 mL', 'Intramuscular', 'HPV4_CRI', TRUE, 'CRIANCA', 108, 119),

-- ----- ADOLESCENTE_JOVEM -----
('HPV4 (Quadrivalente)', 'Vacina quadrivalente contra o papilomavirus humano. Dose unica entre 9 e 14 anos.', '0,5 mL', 'Intramuscular', 'HPV4_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 179),
('Dengue Tetravalente', 'Vacina tetravalente contra os quatro sorotipos do virus da dengue. 2 doses entre 10 e 14 anos conforme historico. Recomenda-se usar laboratorio unico em todo o esquema.', '0,5 mL', 'Subcutanea', 'DENGUE_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 179),
('Meningococica ACWY', 'Vacina conjugada contra os sorogrupos A, C, W-135 e Y do meningococo. Dose unica entre 11 e 14 anos.', '0,5 mL', 'Intramuscular', 'MENACWY_ADO', TRUE, 'ADOLESCENTE_JOVEM', 132, 179),
('Hepatite B', 'Vacina contra o virus da hepatite B. 3 doses entre 10 e 24 anos conforme historico vacinal.', '0,5 mL', 'Intramuscular', 'HEPB_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),
('dT (Dupla Adulto)', 'Vacina contra difteria e tetano. 3 doses entre 10 e 24 anos conforme historico; reforco a cada 10 anos. Profissionais de saude/parteiras e estagiarios com RN: dTpa.', '0,5 mL', 'Intramuscular', 'DT_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),
('Febre Amarela', 'Vacina contra a febre amarela. Dose unica entre 10 e 24 anos conforme historico vacinal; viajantes para areas com transmissao ativa: pelo menos 10 dias antes da viagem.', '0,5 mL', 'Subcutanea', 'FA_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),
('Triplice Viral (SCR)', 'Vacina contra sarampo, caxumba e rubeola. Esquema com 2 doses entre 10 e 24 anos conforme historico vacinal; atencao especial a trabalhadores de saude.', '0,5 mL', 'Subcutanea', 'TVIRAL_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),
('Pneumococica 23-valente', 'Vacina polissacaridica para povos indigenas entre 10 e 24 anos sem historico de pneumo conjugada; 2 doses com intervalo de 5 anos.', '0,5 mL', 'Intramuscular', 'PNEUMO23_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),
('Varicela', 'Vacina contra catapora para povos indigenas e trabalhadores de saude entre 10 e 24 anos sem historico da doenca; conforme historico vacinal.', '0,5 mL', 'Subcutanea', 'VARICELA_ADO', TRUE, 'ADOLESCENTE_JOVEM', 120, 299),

-- ----- ADULTO -----
('Hepatite B', 'Vacina contra o virus da hepatite B. 3 doses entre 25 e 59 anos conforme historico vacinal.', '1 mL', 'Intramuscular', 'HEPB_ADU', TRUE, 'ADULTO', 300, 719),
('dT (Dupla Adulto)', 'Vacina contra difteria e tetano. 3 doses entre 25 e 59 anos conforme historico; reforco a cada 10 anos (antecipado para 5 anos em situacoes de risco). Profissionais de saude e parteiras: dTpa.', '0,5 mL', 'Intramuscular', 'DT_ADU', TRUE, 'ADULTO', 300, 719),
('Febre Amarela', 'Vacina contra a febre amarela. Dose unica entre 25 e 59 anos conforme historico vacinal; viajantes para areas com transmissao ativa: pelo menos 10 dias antes da viagem.', '0,5 mL', 'Subcutanea', 'FA_ADU', TRUE, 'ADULTO', 300, 719),
('Triplice Viral (SCR)', 'Vacina contra sarampo, caxumba e rubeola. Ate 29 anos: 2 doses; 30 a 59 anos: 1 dose; trabalhadores de saude: 2 doses. Conforme historico vacinal.', '0,5 mL', 'Subcutanea', 'TVIRAL_ADU', TRUE, 'ADULTO', 300, 719),
('Pneumococica 23-valente', 'Vacina polissacaridica para povos indigenas entre 25 e 59 anos sem historico de pneumo conjugada; 2 doses com intervalo de 5 anos.', '0,5 mL', 'Intramuscular', 'PNEUMO23_ADU', TRUE, 'ADULTO', 300, 719),
('Varicela', 'Vacina contra catapora para povos indigenas e trabalhadores de saude entre 25 e 59 anos sem historico da doenca; conforme historico vacinal.', '0,5 mL', 'Subcutanea', 'VARICELA_ADU', TRUE, 'ADULTO', 300, 719),

-- ----- IDOSO -----
('Hepatite B', 'Vacina contra o virus da hepatite B. 3 doses a partir dos 60 anos conforme historico vacinal.', '1 mL', 'Intramuscular', 'HEPB_IDO', TRUE, 'IDOSO', 720, NULL),
('dT (Dupla Adulto)', 'Vacina contra difteria e tetano. 3 doses a partir dos 60 anos conforme historico; reforco a cada 10 anos. Profissionais de saude e parteiras: dTpa.', '0,5 mL', 'Intramuscular', 'DT_IDO', TRUE, 'IDOSO', 720, NULL),
('Febre Amarela', 'Vacina contra a febre amarela. A partir dos 60 anos, apenas para nao vacinados em alto risco e que nao possam adiar a exposicao; requer avaliacao individual de saude e contraindicacoes.', '0,5 mL', 'Subcutanea', 'FA_IDO', TRUE, 'IDOSO', 720, NULL),
('Triplice Viral (SCR)', 'Vacina contra sarampo, caxumba e rubeola. Esquema com 2 doses a partir dos 60 anos conforme historico vacinal.', '0,5 mL', 'Subcutanea', 'TVIRAL_IDO', TRUE, 'IDOSO', 720, NULL),
('Pneumococica 23-valente', 'Vacina polissacaridica para idosos acamados ou institucionalizados sem esquema completo, e para povos indigenas sem historico de pneumo conjugada; 2 doses com intervalo de 5 anos.', '0,5 mL', 'Intramuscular', 'PNEUMO23_IDO', TRUE, 'IDOSO', 720, NULL),
('Varicela', 'Vacina contra catapora para povos indigenas e trabalhadores de saude a partir dos 60 anos sem historico da doenca; avaliacao individual de risco-beneficio.', '0,5 mL', 'Subcutanea', 'VARICELA_IDO', TRUE, 'IDOSO', 720, NULL),
('Influenza Trivalente', 'Vacina contra a gripe sazonal. Dose anual com a vacina da temporada para todos a partir dos 60 anos.', '0,5 mL', 'Intramuscular', 'INFLU_IDO', TRUE, 'IDOSO', 720, NULL),
('Covid-19', 'Vacina contra formas graves e obitos por SARS-CoV-2. Dose semestral para todos a partir dos 60 anos.', '0,3 mL ou 0,5 mL (varia por fabricante)', 'Intramuscular', 'COVID19_IDO', TRUE, 'IDOSO', 720, NULL);


-- ============================================================
-- 2. CALENDARIO VACINAL (por dose e faixa etaria em meses)
-- Para gestantes a faixa etaria simboliza a janela reprodutiva
-- (a descricao_dose detalha o trimestre/semana gestacional).
-- ============================================================

INSERT INTO calendario_vacinal (id_vacina, faixa_etaria_min_meses, faixa_etaria_max_meses, publico_alvo, obrigatoria, numero_dose, descricao_dose, ordem_exibicao)
SELECT v.id_vacina, c.faixa_min, c.faixa_max, c.publico, c.obrigatoria, c.numero, c.descricao, c.ordem
FROM (VALUES
  -- GESTANTE
  ('HEPB_GEST',   180, 599, 'Gestantes',          TRUE,  '1a dose', 'Iniciar ao saber da gravidez conforme historico vacinal.', '1'),
  ('HEPB_GEST',   180, 599, 'Gestantes',          TRUE,  '2a dose', '30 dias apos a 1a dose.',                                   '2'),
  ('HEPB_GEST',   180, 599, 'Gestantes',          TRUE,  '3a dose', '6 meses apos a 1a dose.',                                   '3'),
  ('DT_GEST',     180, 599, 'Gestantes',          TRUE,  '1a dose', 'Iniciar ao saber da gravidez conforme historico vacinal.', '1'),
  ('DT_GEST',     180, 599, 'Gestantes',          TRUE,  '2a dose', '60 dias apos a 1a dose.',                                   '2'),
  ('DT_GEST',     180, 599, 'Gestantes',          TRUE,  '3a dose', '60 dias apos a 2a dose.',                                   '3'),
  ('INFLU_GEST',  180, 599, 'Gestantes',          TRUE,  'Dose anual', '1 dose por temporada, ao saber da gravidez.',           '1'),
  ('COVID19_GEST',180, 599, 'Gestantes',          TRUE,  'Dose por gestacao', '1 dose a cada gestacao.',                         '1'),
  ('FA_GEST',     180, 599, 'Gestantes em risco', FALSE, 'Dose unica', 'Apenas em casos excepcionais e areas de risco, apos avaliacao individual.', '1'),
  ('DTPA_GEST',   180, 599, 'Gestantes',          TRUE,  'Dose por gestacao', 'A partir da 20a semana gestacional, 1 dose por gestacao.', '1'),
  ('VVSR_GEST',   180, 599, 'Gestantes',          TRUE,  'Dose por gestacao', 'A partir da 28a semana gestacional, 1 dose por gestacao.', '1'),

  -- CRIANCA
  ('BCG_CRI',          0,   0,  'Recem-nascidos',                TRUE,  'Dose unica', 'Aplicada nas primeiras horas de vida na maternidade.', '1'),
  ('HEPB_CRI',         0,   0,  'Recem-nascidos',                TRUE,  'Dose ao nascer', 'Idealmente nas primeiras 12 horas de vida.',       '1'),
  ('PENTA_CRI',        2,   2,  'Lactentes aos 2 meses',         TRUE,  '1a dose', 'Primeira dose da pentavalente.', '1'),
  ('PENTA_CRI',        4,   4,  'Lactentes aos 4 meses',         TRUE,  '2a dose', 'Segunda dose, 60 dias apos a 1a.', '2'),
  ('PENTA_CRI',        6,   6,  'Lactentes aos 6 meses',         TRUE,  '3a dose', 'Terceira dose da pentavalente.', '3'),
  ('VIP_CRI',          2,   2,  'Lactentes aos 2 meses',         TRUE,  '1a dose', 'Primeira dose da poliomielite inativada.', '1'),
  ('VIP_CRI',          4,   4,  'Lactentes aos 4 meses',         TRUE,  '2a dose', 'Segunda dose da VIP.', '2'),
  ('VIP_CRI',          6,   6,  'Lactentes aos 6 meses',         TRUE,  '3a dose', 'Terceira dose da VIP.', '3'),
  ('PNEUMO10_CRI',     2,   2,  'Lactentes aos 2 meses',         TRUE,  '1a dose', 'Primeira dose da pneumococica 10-valente.', '1'),
  ('PNEUMO10_CRI',     4,   4,  'Lactentes aos 4 meses',         TRUE,  '2a dose', 'Segunda dose.', '2'),
  ('PNEUMO10_CRI',    12,  15,  'Criancas aos 12 meses',         TRUE,  'Reforco', 'Reforco aos 12 meses.', '3'),
  ('ROTAV_CRI',        1,   3,  'Lactentes aos 2 meses',         TRUE,  '1a dose', '1a dose entre 1m15d e 3m15d (improrrogavel).', '1'),
  ('ROTAV_CRI',        3,   7,  'Lactentes aos 4 meses',         TRUE,  '2a dose', '2a dose entre 3m15d e 7m29d (improrrogavel).', '2'),
  ('MENINGOC_CRI',     3,   3,  'Lactentes aos 3 meses',         TRUE,  '1a dose', 'Primeira dose da Meningo C conjugada.', '1'),
  ('MENINGOC_CRI',     5,   5,  'Lactentes aos 5 meses',         TRUE,  '2a dose', 'Segunda dose da Meningo C.', '2'),
  ('INFLU_CRI',        6, 119,  'Criancas de 6m a 9 anos',       TRUE,  '1a dose', 'Primeira dose anual; na primovacinacao em <9 anos sao 2 doses com 30 dias.', '1'),
  ('INFLU_CRI',        7, 119,  'Criancas de 6m a 9 anos',       TRUE,  '2a dose', 'Segunda dose da primovacinacao, 30 dias apos a 1a.', '2'),
  ('COVID19_CRI',      6,  11,  'Criancas a partir de 6 meses',  TRUE,  '1a dose', 'Inicio do esquema contra Covid-19.', '1'),
  ('COVID19_CRI',      7,  12,  'Criancas a partir de 6 meses',  TRUE,  '2a dose', '4 semanas apos a 1a dose.', '2'),
  ('FA_CRI',           9,   9,  'Criancas aos 9 meses',          TRUE,  '1a dose', '1a dose aos 9 meses.', '1'),
  ('FA_CRI',          48,  48,  'Criancas aos 4 anos',           TRUE,  'Reforco', 'Reforco aos 4 anos de idade.', '2'),
  ('MENACWY_CRI',     12,  12,  'Criancas aos 12 meses',         TRUE,  'Reforco', 'Reforco aos 12 meses (substitui o reforco da Meningo C).', '1'),
  ('TVIRAL_CRI',      12,  12,  'Criancas aos 12 meses',         TRUE,  '1a dose', '1a dose aos 12 meses.', '1'),
  ('TVIRAL_CRI',      15,  15,  'Criancas aos 15 meses',         TRUE,  '2a dose', '2a dose aos 15 meses (Tetra Viral se disponivel).', '2'),
  ('DTP_CRI',         15,  15,  'Criancas aos 15 meses',         TRUE,  '1o reforco', '1o reforco contra DTP.', '1'),
  ('DTP_CRI',         48,  48,  'Criancas aos 4 anos',           TRUE,  '2o reforco', '2o reforco aos 4 anos.', '2'),
  ('VARICELA_CRI',    15,  15,  'Criancas aos 15 meses',         TRUE,  '1a dose', '1a dose aos 15 meses (Tetra Viral).', '1'),
  ('VARICELA_CRI',    48,  48,  'Criancas aos 4 anos',           TRUE,  '2a dose', '2a dose aos 4 anos.', '2'),
  ('HEPA_CRI',        15,  15,  'Criancas aos 15 meses',         TRUE,  'Dose unica', 'Uma dose aos 15 meses.', '1'),
  ('PNEUMO23_CRI',    60, 119,  'Povos indigenas a partir de 5a', FALSE,'1a dose', 'Sem historico de pneumo conjugada. 2a dose com intervalo de 5 anos (sera aplicada na faixa de Adolescente).', '1'),
  ('DT_CRI',          84, 119,  'Criancas a partir de 7 anos',   FALSE, 'Esquema', 'Para completar esquema em atraso.', '1'),
  ('HPV4_CRI',       108, 119,  'Criancas de 9 a 14 anos',       TRUE,  'Dose unica', 'Uma dose entre 9 e 14 anos (ambos os sexos).', '1'),

  -- ADOLESCENTE_JOVEM
  ('HPV4_ADO',       120, 179,  'Adolescentes de 10 a 14 anos',  TRUE,  'Dose unica', 'Uma dose ate 14 anos.', '1'),
  ('DENGUE_ADO',     120, 179,  'Adolescentes de 10 a 14 anos',  TRUE,  '1a dose', '1a dose entre 10 e 14 anos.', '1'),
  ('DENGUE_ADO',     120, 179,  'Adolescentes de 10 a 14 anos',  TRUE,  '2a dose', '3 meses apos a 1a dose; usar mesmo laboratorio.', '2'),
  ('MENACWY_ADO',    132, 179,  'Adolescentes de 11 a 14 anos',  TRUE,  'Dose unica', 'Uma dose entre 11 e 14 anos.', '1'),
  ('HEPB_ADO',       120, 299,  'De 10 a 24 anos',                FALSE,'1a dose', 'Iniciar conforme historico vacinal.', '1'),
  ('HEPB_ADO',       120, 299,  'De 10 a 24 anos',                FALSE,'2a dose', '30 dias apos a 1a.', '2'),
  ('HEPB_ADO',       120, 299,  'De 10 a 24 anos',                FALSE,'3a dose', '6 meses apos a 1a.', '3'),
  ('DT_ADO',         120, 299,  'De 10 a 24 anos',                FALSE,'1a dose', 'Iniciar conforme historico.', '1'),
  ('DT_ADO',         120, 299,  'De 10 a 24 anos',                FALSE,'2a dose', '60 dias apos a 1a.', '2'),
  ('DT_ADO',         120, 299,  'De 10 a 24 anos',                FALSE,'3a dose', '60 dias apos a 2a.', '3'),
  ('DT_ADO',         120, 299,  'De 10 a 24 anos',                FALSE,'Reforco decenal', '1 reforco a cada 10 anos (5 em situacoes de risco).', '4'),
  ('FA_ADO',         120, 299,  'De 10 a 24 anos',                FALSE,'Dose unica', 'Conforme historico vacinal.', '1'),
  ('TVIRAL_ADO',     120, 299,  'De 10 a 24 anos',                FALSE,'1a dose', 'Conforme historico vacinal.', '1'),
  ('TVIRAL_ADO',     120, 299,  'De 10 a 24 anos',                FALSE,'2a dose', '30 dias apos a 1a dose.', '2'),
  ('PNEUMO23_ADO',   120, 299,  'Povos indigenas de 10 a 24a',   FALSE, '1a dose', 'Sem historico de pneumo conjugada.', '1'),
  ('PNEUMO23_ADO',   120, 299,  'Povos indigenas de 10 a 24a',   FALSE, '2a dose', '2a dose com intervalo de 5 anos.', '2'),
  ('VARICELA_ADO',   120, 299,  'Grupos especificos 10 a 24a',   FALSE, '1a dose', 'Povos indigenas/trabalhadores de saude sem historico.', '1'),
  ('VARICELA_ADO',   120, 299,  'Grupos especificos 10 a 24a',   FALSE, '2a dose', '3 meses apos a 1a dose.', '2'),

  -- ADULTO
  ('HEPB_ADU',       300, 719,  'Adultos de 25 a 59 anos',       FALSE, '1a dose', 'Iniciar conforme historico vacinal.', '1'),
  ('HEPB_ADU',       300, 719,  'Adultos de 25 a 59 anos',       FALSE, '2a dose', '30 dias apos a 1a.', '2'),
  ('HEPB_ADU',       300, 719,  'Adultos de 25 a 59 anos',       FALSE, '3a dose', '6 meses apos a 1a.', '3'),
  ('DT_ADU',         300, 719,  'Adultos de 25 a 59 anos',       FALSE, '1a dose', 'Iniciar conforme historico.', '1'),
  ('DT_ADU',         300, 719,  'Adultos de 25 a 59 anos',       FALSE, '2a dose', '60 dias apos a 1a.', '2'),
  ('DT_ADU',         300, 719,  'Adultos de 25 a 59 anos',       FALSE, '3a dose', '60 dias apos a 2a.', '3'),
  ('DT_ADU',         300, 719,  'Adultos de 25 a 59 anos',       FALSE, 'Reforco decenal', '1 reforco a cada 10 anos (5 em situacoes de risco).', '4'),
  ('FA_ADU',         300, 719,  'Adultos de 25 a 59 anos',       FALSE, 'Dose unica', 'Conforme historico vacinal.', '1'),
  ('TVIRAL_ADU',     300, 359,  'Adultos ate 29 anos',           FALSE, '1a dose', 'Conforme historico vacinal.', '1'),
  ('TVIRAL_ADU',     300, 359,  'Adultos ate 29 anos',           FALSE, '2a dose', '30 dias apos a 1a.', '2'),
  ('TVIRAL_ADU',     360, 719,  'Adultos 30 a 59 anos',          FALSE, 'Dose unica', 'Apenas 1 dose; 2a dose se trabalhador de saude.', '3'),
  ('PNEUMO23_ADU',   300, 719,  'Povos indigenas adultos',       FALSE, '1a dose', 'Sem historico de pneumo conjugada.', '1'),
  ('PNEUMO23_ADU',   300, 719,  'Povos indigenas adultos',       FALSE, '2a dose', '2a dose com intervalo de 5 anos.', '2'),
  ('VARICELA_ADU',   300, 719,  'Grupos especificos adultos',    FALSE, '1a dose', 'Povos indigenas/trabalhadores de saude sem historico.', '1'),
  ('VARICELA_ADU',   300, 719,  'Grupos especificos adultos',    FALSE, '2a dose', '3 meses apos a 1a dose.', '2'),

  -- IDOSO
  ('HEPB_IDO',       720, 1199, 'Idosos a partir de 60 anos',    FALSE, '1a dose', 'Iniciar conforme historico vacinal.', '1'),
  ('HEPB_IDO',       720, 1199, 'Idosos a partir de 60 anos',    FALSE, '2a dose', '30 dias apos a 1a.', '2'),
  ('HEPB_IDO',       720, 1199, 'Idosos a partir de 60 anos',    FALSE, '3a dose', '6 meses apos a 1a.', '3'),
  ('DT_IDO',         720, 1199, 'Idosos a partir de 60 anos',    FALSE, '1a dose', 'Iniciar conforme historico.', '1'),
  ('DT_IDO',         720, 1199, 'Idosos a partir de 60 anos',    FALSE, '2a dose', '60 dias apos a 1a.', '2'),
  ('DT_IDO',         720, 1199, 'Idosos a partir de 60 anos',    FALSE, '3a dose', '60 dias apos a 2a.', '3'),
  ('DT_IDO',         720, 1199, 'Idosos a partir de 60 anos',    FALSE, 'Reforco decenal', '1 reforco a cada 10 anos (5 em situacoes de risco).', '4'),
  ('FA_IDO',         720, 1199, 'Idosos selecionados',           FALSE, 'Dose unica', 'Somente nao vacinados em alto risco; avaliacao individual.', '1'),
  ('TVIRAL_IDO',     720, 1199, 'Idosos a partir de 60 anos',    FALSE, '1a dose', 'Conforme historico vacinal.', '1'),
  ('TVIRAL_IDO',     720, 1199, 'Idosos a partir de 60 anos',    FALSE, '2a dose', '30 dias apos a 1a.', '2'),
  ('PNEUMO23_IDO',   720, 1199, 'Idosos institucionalizados/indigenas', FALSE, '1a dose', 'Sem esquema completo previo.', '1'),
  ('PNEUMO23_IDO',   720, 1199, 'Idosos institucionalizados/indigenas', FALSE, '2a dose', 'Intervalo de 5 anos apos a 1a.', '2'),
  ('VARICELA_IDO',   720, 1199, 'Grupos especificos idosos',     FALSE, '1a dose', 'Avaliacao individual; sem historico da doenca.', '1'),
  ('VARICELA_IDO',   720, 1199, 'Grupos especificos idosos',     FALSE, '2a dose', '3 meses apos a 1a dose.', '2'),
  ('INFLU_IDO',      720, 1199, 'Idosos a partir de 60 anos',    TRUE,  'Dose anual', '1 dose por temporada com a vacina atualizada.', '1'),
  ('COVID19_IDO',    720, 1199, 'Idosos a partir de 60 anos',    TRUE,  'Dose semestral', '1 dose a cada 6 meses.', '1')
) AS c(codigo, faixa_min, faixa_max, publico, obrigatoria, numero, descricao, ordem)
JOIN vacina v ON v.codigo_pni = c.codigo;


-- ============================================================
-- 3. INFORMATIVOS (vacina_informativo) - 1 por vacina, versao=1
-- ============================================================

INSERT INTO vacina_informativo (id_vacina, versao, data_publicacao, orgao_emissor, fonte_referencia)
SELECT v.id_vacina, 1, DATE '2026-05-21', 'Ministerio da Saude - PNI', 'https://www.gov.br/saude/pt-br/vacinacao/calendario'
FROM vacina v
WHERE v.codigo_pni ~ '_(GEST|CRI|ADO|ADU|IDO)$';


-- ============================================================
-- 4. SECOES INFORMATIVAS (vacina_secao_informativa)
-- Estrategia: agrupar por "vacina conceitual" (mesmo texto para
-- as variantes da mesma vacina em grupos diferentes) usando IN().
-- 4 secoes padrao: Para que serve / Quem deve tomar /
-- Contraindicacoes / Cuidados apos a vacinacao.
-- ============================================================

INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  -- BCG
  ('BCG_CRI', 'Para que serve', 'Protege contra as formas graves da tuberculose (miliar e meningea) e tem efeito protetor contra a hanseniase.', 1),
  ('BCG_CRI', 'Quem deve tomar', 'Recem-nascidos com peso >= 2 kg na maternidade. Criancas ate 4 anos, 11 meses e 29 dias sem cicatriz vacinal podem receber.', 2),
  ('BCG_CRI', 'Contraindicacoes', 'Recem-nascidos com peso < 2 kg, imunodeficiencias e uso de imunossupressores.', 3),
  ('BCG_CRI', 'Cuidados apos a vacinacao', 'No local surge uma lesao que evolui ate formar cicatriz em 3 a 6 meses. Nao cobrir, nao apertar e nao usar pomadas.', 4),

  -- Penta
  ('PENTA_CRI', 'Para que serve', 'Vacina combinada contra difteria, tetano, coqueluche, Haemophilus influenzae tipo B e hepatite B.', 1),
  ('PENTA_CRI', 'Quem deve tomar', 'Lactentes aos 2, 4 e 6 meses. Reforcos com DTP aos 15 meses e aos 4 anos.', 2),
  ('PENTA_CRI', 'Contraindicacoes', 'Reacao anafilatica a dose anterior, encefalopatia ate 7 dias apos dose previa, doenca neurologica em atividade.', 3),
  ('PENTA_CRI', 'Cuidados apos a vacinacao', 'Dor local, induracao e febre sao comuns nas primeiras 48h. Compressas frias e antitermico conforme orientacao.', 4),

  -- VIP
  ('VIP_CRI', 'Para que serve', 'Protege contra a poliomielite (paralisia infantil). Substitui a antiga gotinha (VOP) no esquema basico.', 1),
  ('VIP_CRI', 'Quem deve tomar', 'Criancas aos 2, 4 e 6 meses; reforcos aos 15 meses e aos 4 anos.', 2),
  ('VIP_CRI', 'Contraindicacoes', 'Reacao anafilatica previa a vacina ou a algum de seus componentes (neomicina, estreptomicina, polimixina B).', 3),
  ('VIP_CRI', 'Cuidados apos a vacinacao', 'Por ser inativada, raramente provoca eventos. Pode haver dor local leve e febre baixa.', 4),

  -- Pneumo10
  ('PNEUMO10_CRI', 'Para que serve', 'Protege contra dez sorotipos do pneumococo, responsaveis por meningite, pneumonia, sepse e otite media aguda.', 1),
  ('PNEUMO10_CRI', 'Quem deve tomar', 'Lactentes aos 2 e 4 meses, com reforco aos 12 meses.', 2),
  ('PNEUMO10_CRI', 'Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina ou ao toxoide difterico.', 3),
  ('PNEUMO10_CRI', 'Cuidados apos a vacinacao', 'Dor, vermelhidao e endurecimento local sao frequentes. Febre, irritabilidade e sonolencia podem ocorrer.', 4),

  -- Rotavirus
  ('ROTAV_CRI', 'Para que serve', 'Previne a gastroenterite grave causada pelo rotavirus, principal causa de diarreia grave em criancas pequenas.', 1),
  ('ROTAV_CRI', 'Quem deve tomar', '1a dose entre 1m15d e 3m15d; 2a dose entre 3m15d e 7m29d. Idades maximas improrrogaveis.', 2),
  ('ROTAV_CRI', 'Contraindicacoes', 'Historico de invaginacao intestinal, malformacao intestinal nao corrigida, imunodeficiencia combinada grave.', 3),
  ('ROTAV_CRI', 'Cuidados apos a vacinacao', 'Pode causar irritabilidade, vomito ou diarreia leve. Procurar emergencia em caso de choro intenso continuo ou sangue nas fezes.', 4),

  -- Meningo C
  ('MENINGOC_CRI', 'Para que serve', 'Protege contra a doenca meningococica causada pelo sorogrupo C (meningite e meningococcemia).', 1),
  ('MENINGOC_CRI', 'Quem deve tomar', 'Lactentes aos 3 e 5 meses. O reforco passou a ser feito com a Meningo ACWY aos 12 meses.', 2),
  ('MENINGOC_CRI', 'Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina.', 3),
  ('MENINGOC_CRI', 'Cuidados apos a vacinacao', 'Reacoes locais e sistemicas leves (febre, irritabilidade) sao comuns.', 4),

  -- Penta/Hep A
  ('HEPA_CRI', 'Para que serve', 'Vacina contra o virus da hepatite A, que causa inflamacao aguda do figado.', 1),
  ('HEPA_CRI', 'Quem deve tomar', 'Dose unica aos 15 meses de idade.', 2),
  ('HEPA_CRI', 'Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina.', 3),
  ('HEPA_CRI', 'Cuidados apos a vacinacao', 'Dor local, febre baixa e mal-estar geralmente desaparecem em 1-2 dias.', 4),

  -- DTP
  ('DTP_CRI', 'Para que serve', 'Vacina contra difteria, tetano e coqueluche para os reforcos do esquema basico.', 1),
  ('DTP_CRI', 'Quem deve tomar', '1o reforco aos 15 meses e 2o reforco aos 4 anos.', 2),
  ('DTP_CRI', 'Contraindicacoes', 'Reacao anafilatica a dose anterior, encefalopatia ate 7 dias apos dose previa.', 3),
  ('DTP_CRI', 'Cuidados apos a vacinacao', 'Reacoes locais e sistemicas leves, semelhantes a Penta.', 4),

  -- Dengue
  ('DENGUE_ADO', 'Para que serve', 'Vacina tetravalente contra os quatro sorotipos do virus da dengue.', 1),
  ('DENGUE_ADO', 'Quem deve tomar', 'Adolescentes de 10 a 14 anos conforme historico vacinal. Recomenda-se utilizar o mesmo laboratorio em todas as doses.', 2),
  ('DENGUE_ADO', 'Contraindicacoes', 'Imunodepressao, gestantes, lactantes e pessoas com reacao anafilatica a doses anteriores.', 3),
  ('DENGUE_ADO', 'Cuidados apos a vacinacao', 'Dor local, cefaleia, mal-estar e febre baixa sao reacoes comuns.', 4),

  -- dTpa (gestante)
  ('DTPA_GEST', 'Para que serve', 'Vacina contra difteria, tetano e coqueluche (acelular). Aplicada na gestante para proteger o bebe contra coqueluche nos primeiros dias de vida.', 1),
  ('DTPA_GEST', 'Quem deve tomar', 'A partir da 20a semana gestacional, 1 dose por gestacao, independentemente do historico vacinal anterior.', 2),
  ('DTPA_GEST', 'Contraindicacoes', 'Reacao anafilatica previa a algum componente; encefalopatia ate 7 dias apos dose previa de vacina pertussis.', 3),
  ('DTPA_GEST', 'Cuidados apos a vacinacao', 'Dor local e febre baixa sao reacoes comuns.', 4),

  -- VVSR (gestante)
  ('VVSR_GEST', 'Para que serve', 'Vacina contra o virus sincicial respiratorio (VSR), aplicada na gestante para proteger o bebe contra bronquiolite e pneumonia nos primeiros 6 meses de vida.', 1),
  ('VVSR_GEST', 'Quem deve tomar', 'Gestantes a partir da 28a semana gestacional, 1 dose por gestacao.', 2),
  ('VVSR_GEST', 'Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina.', 3),
  ('VVSR_GEST', 'Cuidados apos a vacinacao', 'Reacoes locais leves (dor, vermelhidao) e cefaleia podem ocorrer.', 4)
) AS s(codigo, titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni = s.codigo
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;


-- Secoes compartilhadas: vacinas conceituais que aparecem em
-- multiplos grupos com mesmo texto de informativo.

-- Hepatite B (5 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Previne a infeccao pelo virus da hepatite B, que pode evoluir para hepatite cronica, cirrose e cancer de figado.', 1),
  ('Quem deve tomar', 'Esquema com 3 doses (0, 30 e 180 dias) conforme historico vacinal. Recem-nascidos: 1a dose ao nascer; demais doses via Penta. Adolescentes, adultos e idosos sem esquema completo devem iniciar/completar.', 2),
  ('Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina ou reacao anafilatica a dose anterior.', 3),
  ('Cuidados apos a vacinacao', 'Dor, vermelhidao ou endurecimento local. Febre baixa pode aparecer e desaparece em 1-2 dias.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('HEPB_GEST','HEPB_CRI','HEPB_ADO','HEPB_ADU','HEPB_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- dT (Dupla Adulto) (5 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Protege contra difteria e tetano em adolescentes, adultos e idosos.', 1),
  ('Quem deve tomar', 'Esquema com 3 doses (0, 60 e 120 dias) conforme historico vacinal. Reforco a cada 10 anos (antecipado para 5 anos em ferimentos com risco de tetano). Gestantes e profissionais de saude/parteiras usam dTpa quando indicado.', 2),
  ('Contraindicacoes', 'Reacao anafilatica previa a dose anterior ou a algum componente.', 3),
  ('Cuidados apos a vacinacao', 'Dor, vermelhidao e endurecimento local sao comuns. Febre baixa pode ocorrer.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('DT_GEST','DT_CRI','DT_ADO','DT_ADU','DT_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Influenza (3 grupos: gestante/crianca/idoso)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Previne a gripe sazonal causada pelos virus Influenza. A composicao e atualizada anualmente conforme as cepas circulantes.', 1),
  ('Quem deve tomar', 'Gestantes, criancas de 6m a <6 anos, idosos a partir de 60 anos e demais grupos prioritarios na campanha anual. Em <9 anos na primovacinacao: 2 doses com 30 dias.', 2),
  ('Contraindicacoes', 'Reacao anafilatica previa a vacina ou a algum dos componentes; alergia grave ao ovo requer avaliacao individual.', 3),
  ('Cuidados apos a vacinacao', 'Dor local e febre baixa sao as reacoes mais comuns, geralmente resolvendo em 1-2 dias.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('INFLU_GEST','INFLU_CRI','INFLU_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Covid-19 (3 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Previne formas graves e obitos por Covid-19, com bom perfil de seguranca demonstrado em estudos clinicos.', 1),
  ('Quem deve tomar', 'Gestantes (1 dose por gestacao); criancas a partir de 6 meses (esquema completo varia por fabricante); idosos (dose semestral). Imunocomprometidos seguem esquema especifico.', 2),
  ('Contraindicacoes', 'Reacao anafilatica previa a uma dose anterior ou a algum componente da vacina.', 3),
  ('Cuidados apos a vacinacao', 'Dor local, febre baixa, cansaco e cefaleia sao reacoes comuns nas primeiras 48 horas.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('COVID19_GEST','COVID19_CRI','COVID19_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Febre Amarela (5 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Protege contra a febre amarela, doenca viral transmitida por mosquitos com alta letalidade nas formas graves.', 1),
  ('Quem deve tomar', 'Criancas: 9 meses + reforco aos 4 anos. Adolescentes/adultos: dose unica conforme historico. Gestantes e idosos: apenas em situacoes excepcionais e areas de risco, com avaliacao individual. Viajantes: pelo menos 10 dias antes da viagem.', 2),
  ('Contraindicacoes', 'Imunodeficiencia, quimioterapia, transplantados, alergia grave ao ovo, gestantes (salvo casos excepcionais), criancas < 6 meses.', 3),
  ('Cuidados apos a vacinacao', 'Pode causar febre, cefaleia e mal-estar entre o 3o e o 7o dia. Procurar servico de saude em caso de sintomas neurologicos, icterio ou febre persistente.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('FA_GEST','FA_CRI','FA_ADO','FA_ADU','FA_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Meningococica ACWY (2 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Protege contra os sorogrupos A, C, W e Y do meningococo, agentes de meningite e meningococcemia.', 1),
  ('Quem deve tomar', 'Criancas aos 12 meses (reforco) e adolescentes de 11 a 14 anos (dose unica).', 2),
  ('Contraindicacoes', 'Reacao anafilatica a dose anterior ou a algum componente da vacina.', 3),
  ('Cuidados apos a vacinacao', 'Dor local, cefaleia e mal-estar passageiros sao os efeitos mais comuns.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('MENACWY_CRI','MENACWY_ADO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Triplice Viral SCR (4 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Protege contra sarampo, caxumba e rubeola, tres doencas virais altamente contagiosas.', 1),
  ('Quem deve tomar', 'Criancas: 1a dose aos 12m, 2a aos 15m. Ate 29 anos: 2 doses; 30 a 59 anos: 1 dose; trabalhadores de saude: sempre 2 doses. Idosos: 2 doses conforme historico.', 2),
  ('Contraindicacoes', 'Gestantes, imunocomprometidos, em uso de imunossupressores ou com historico de anafilaxia a componentes.', 3),
  ('Cuidados apos a vacinacao', 'Pode haver febre, exantema leve e dor articular entre o 5o e o 12o dia. Procurar atendimento em caso de reacao alergica ou sinais neurologicos.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('TVIRAL_CRI','TVIRAL_ADO','TVIRAL_ADU','TVIRAL_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Varicela (4 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Protege contra a varicela (catapora), doenca viral altamente contagiosa.', 1),
  ('Quem deve tomar', 'Criancas: 1a dose aos 15m, 2a aos 4 anos. Em adolescentes, adultos e idosos: indicada para povos indigenas, trabalhadores de saude e grupos especificos sem historico da doenca.', 2),
  ('Contraindicacoes', 'Gestantes, imunocomprometidos e uso de imunossupressores.', 3),
  ('Cuidados apos a vacinacao', 'Pode haver dor local e exantema leve em 5-26 dias apos a vacinacao.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('VARICELA_CRI','VARICELA_ADO','VARICELA_ADU','VARICELA_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- Pneumococica 23-valente (4 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Vacina polissacaridica contra 23 sorotipos do pneumococo, agentes de doencas pneumococicas invasivas.', 1),
  ('Quem deve tomar', 'Povos indigenas a partir de 5 anos sem historico de pneumo conjugada e idosos acamados/institucionalizados sem esquema completo. 2 doses com intervalo de 5 anos.', 2),
  ('Contraindicacoes', 'Hipersensibilidade a qualquer componente da vacina.', 3),
  ('Cuidados apos a vacinacao', 'Dor, vermelhidao e endurecimento local sao as reacoes mais comuns.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('PNEUMO23_CRI','PNEUMO23_ADO','PNEUMO23_ADU','PNEUMO23_IDO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;

-- HPV4 (2 grupos)
INSERT INTO vacina_secao_informativa (id_informativo, titulo_secao, conteudo, ordem_exibicao)
SELECT inf.id_informativo, s.titulo, s.conteudo, s.ordem
FROM (VALUES
  ('Para que serve', 'Vacina quadrivalente contra o papilomavirus humano (HPV), agente de cancer de colo de utero e outros canceres relacionados ao HPV.', 1),
  ('Quem deve tomar', 'Dose unica entre 9 e 14 anos, para ambos os sexos.', 2),
  ('Contraindicacoes', 'Hipersensibilidade a qualquer componente; gestantes.', 3),
  ('Cuidados apos a vacinacao', 'Dor local, cefaleia, mal-estar e febre baixa sao reacoes comuns.', 4)
) AS s(titulo, conteudo, ordem)
JOIN vacina v ON v.codigo_pni IN ('HPV4_CRI','HPV4_ADO')
JOIN vacina_informativo inf ON inf.id_vacina = v.id_vacina AND inf.versao = 1;


-- ============================================================
-- 5. EFEITOS COLATERAIS (vacina_efeito_colateral)
-- Severidade: LEVE | MODERADA | GRAVE
-- ============================================================

INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  -- BCG
  ('BCG_CRI', 'Formacao de papula, ulcera e cicatriz no local da aplicacao (evolucao normal em 3-6 meses).', 'LEVE',     'Nao cobrir, nao apertar e nao usar pomadas. Manter o local limpo e seco.'),
  ('BCG_CRI', 'Linfadenite axilar (ganglio aumentado na axila).',                                            'MODERADA', 'Procurar servico de saude se ganglio > 3 cm ou fistulizar.'),

  -- Penta
  ('PENTA_CRI', 'Dor, vermelhidao e endurecimento intenso no local.',                                   'LEVE',     'Compressa fria nas primeiras 24h. Antitermico se prescrito pelo pediatra.'),
  ('PENTA_CRI', 'Febre alta acima de 39,5C nas primeiras 48 horas.',                                    'MODERADA', 'Antitermico conforme orientacao. Procurar servico de saude se persistir > 48h.'),
  ('PENTA_CRI', 'Choro persistente > 3h, episodio hipotonico-hiporresponsivo ou convulsao.',            'GRAVE',    'Atendimento medico imediato e relato a UBS para notificacao de evento adverso.'),

  -- VIP
  ('VIP_CRI', 'Dor local leve e febre baixa.', 'LEVE', 'Compressa fria local e antitermico se necessario.'),

  -- Pneumo10
  ('PNEUMO10_CRI', 'Dor, vermelhidao e endurecimento no local.',                  'LEVE', 'Compressa fria. Sintomas se resolvem em 24-48h.'),
  ('PNEUMO10_CRI', 'Febre, irritabilidade e sonolencia nas primeiras 48 horas.', 'LEVE', 'Antitermico conforme orientacao. Manter hidratacao.'),

  -- Rotavirus
  ('ROTAV_CRI', 'Irritabilidade, perda de apetite, vomito ou diarreia leve.',                                  'LEVE',  'Manter hidratacao. Sintomas desaparecem em 1-3 dias.'),
  ('ROTAV_CRI', 'Invaginacao intestinal (rara): choro intenso continuo, vomitos repetidos, sangue nas fezes.', 'GRAVE', 'Procurar pronto-socorro imediatamente.'),

  -- Meningo C
  ('MENINGOC_CRI', 'Dor, vermelhidao e endurecimento no local.',           'LEVE', 'Compressa fria local. Reacao desaparece em 24-48h.'),
  ('MENINGOC_CRI', 'Febre, irritabilidade, perda de apetite e sonolencia.', 'LEVE', 'Antitermico se necessario, conforme orientacao do pediatra.'),

  -- Hepatite A
  ('HEPA_CRI', 'Dor local, febre baixa e mal-estar.', 'LEVE', 'Compressa fria e antitermico conforme orientacao. Sintomas resolvem em 1-2 dias.'),

  -- DTP
  ('DTP_CRI', 'Dor local intensa, vermelhidao e induracao.',           'LEVE',     'Compressa fria local e antitermico se necessario.'),
  ('DTP_CRI', 'Febre alta e irritabilidade nas primeiras 48 horas.',  'MODERADA', 'Antitermico conforme orientacao. Procurar UBS se persistir > 48h.'),

  -- Dengue
  ('DENGUE_ADO', 'Dor local, cefaleia, mal-estar e febre baixa.', 'LEVE', 'Hidratacao, repouso e antitermico se necessario.'),

  -- dTpa
  ('DTPA_GEST', 'Dor, vermelhidao e endurecimento no local.', 'LEVE', 'Compressa fria local. Reacao se resolve em 24-48h.'),
  ('DTPA_GEST', 'Febre baixa, cefaleia e mal-estar.',         'LEVE', 'Hidratacao e antitermico conforme orientacao do pre-natal.'),

  -- VVSR
  ('VVSR_GEST', 'Dor e vermelhidao no local da aplicacao.', 'LEVE', 'Compressa fria local.'),
  ('VVSR_GEST', 'Cefaleia, fadiga e mal-estar.',           'LEVE', 'Hidratacao e repouso. Procurar pre-natal se persistir > 48h.')
) AS e(codigo, descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni = e.codigo;

-- Efeitos compartilhados entre variantes da mesma vacina conceitual

-- Hepatite B (5 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor, vermelhidao ou endurecimento no local da aplicacao.', 'LEVE', 'Compressa fria. Sintomas costumam desaparecer em 1-2 dias.'),
  ('Febre baixa, irritabilidade ou cansaco nas primeiras 48 horas.', 'LEVE', 'Hidratacao e antitermico conforme orientacao.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('HEPB_GEST','HEPB_CRI','HEPB_ADO','HEPB_ADU','HEPB_IDO');

-- dT (5 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor, vermelhidao e endurecimento no local.', 'LEVE', 'Compressa fria local; sintomas resolvem em 24-48h.'),
  ('Febre baixa e mal-estar.',                   'LEVE', 'Hidratacao e antitermico se necessario.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('DT_GEST','DT_CRI','DT_ADO','DT_ADU','DT_IDO');

-- Influenza (3 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, febre baixa e mal-estar.', 'LEVE', 'Compressa fria e antitermico. Sintomas desaparecem em 1-2 dias.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('INFLU_GEST','INFLU_CRI','INFLU_IDO');

-- Covid-19 (3 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, febre baixa, cansaco e cefaleia.', 'LEVE', 'Compressa fria e antitermico se necessario. Hidratacao e repouso.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('COVID19_GEST','COVID19_CRI','COVID19_IDO');

-- Febre Amarela (5 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, febre, cefaleia e mal-estar entre o 3o e o 7o dia.',     'LEVE',  'Hidratacao, repouso e antitermico se necessario.'),
  ('Doenca viscerotropica ou neurologica pos-vacinal (extremamente rara).', 'GRAVE', 'Atendimento medico imediato em caso de icterio, sintomas neurologicos ou febre persistente.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('FA_GEST','FA_CRI','FA_ADO','FA_ADU','FA_IDO');

-- Meningo ACWY (2 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, cefaleia e mal-estar passageiros.', 'LEVE', 'Compressa fria e antitermico se necessario.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('MENACWY_CRI','MENACWY_ADO');

-- Triplice Viral SCR (4 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Febre, exantema leve e dor articular entre o 5o e o 12o dia.', 'LEVE',  'Hidratacao, repouso e antitermico se necessario.'),
  ('Reacao anafilatica ou sinais neurologicos.',                   'GRAVE', 'Atendimento medico imediato.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('TVIRAL_CRI','TVIRAL_ADO','TVIRAL_ADU','TVIRAL_IDO');

-- Varicela (4 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, febre baixa e exantema leve entre 5-26 dias.', 'LEVE', 'Hidratacao e antitermico conforme orientacao.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('VARICELA_CRI','VARICELA_ADO','VARICELA_ADU','VARICELA_IDO');

-- Pneumo 23 (4 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor, vermelhidao e endurecimento no local.', 'LEVE', 'Compressa fria local. Sintomas resolvem em 24-48h.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('PNEUMO23_CRI','PNEUMO23_ADO','PNEUMO23_ADU','PNEUMO23_IDO');

-- HPV4 (2 grupos)
INSERT INTO vacina_efeito_colateral (id_vacina, descricao, severidade, orientacao)
SELECT v.id_vacina, e.descricao, e.severidade, e.orientacao
FROM (VALUES
  ('Dor local, cefaleia, mal-estar e febre baixa.', 'LEVE', 'Hidratacao, repouso e antitermico se necessario.'),
  ('Sincope vasovagal apos a aplicacao.',           'LEVE', 'Permanecer sentada ou deitada por 15 min apos a vacina.')
) AS e(descricao, severidade, orientacao)
JOIN vacina v ON v.codigo_pni IN ('HPV4_CRI','HPV4_ADO');


-- ============================================================
-- 6. RECRIAR CHECK CONSTRAINT com os 5 valores novos
-- ============================================================

ALTER TABLE vacina
  ADD CONSTRAINT vacina_tipo_secao_vacinacao_check
  CHECK (tipo_secao_vacinacao IN ('GESTANTE','CRIANCA','ADOLESCENTE_JOVEM','ADULTO','IDOSO'));

COMMIT;

-- ============================================================
-- FIM DO SEED - Vacinas PNI organizadas pelos 5 grupos oficiais
-- Total de vacinas: 48 (por par vacina x grupo)
-- Vacinas conceituais: 21
-- Grupos: GESTANTE (7), CRIANCA (18), ADO_JOVEM (9), ADULTO (6), IDOSO (8)
-- ============================================================
