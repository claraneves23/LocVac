-- ============================================================
-- Seed: Doses complementares + backfill de numero_dose/tipo_dose
-- Fonte: https://www.gov.br/saude/pt-br/vacinacao/calendario
-- ============================================================
-- Pre-requisito: as colunas numero_dose e tipo_dose ja devem
-- existir na tabela vacina (criadas pelo Hibernate apos deploy
-- do backend com os novos campos na entidade Vacina).
--
-- Idempotente:
--   * UPDATEs setam valores fixos (rodar varias vezes nao afeta)
--   * INSERTs usam ON CONFLICT (codigo_pni) DO NOTHING
--
-- Como rodar:
--   psql "$DATABASE_URL" -f locvac/src/main/resources/db/seed_doses_complementares.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1) Correcao: Febre Amarela 1a dose vai aos 9 meses (nao 6)
-- ============================================================
-- A janela 6-8 meses so vale em situacao excepcional (area de
-- transmissao ativa). A regra geral do PNI e 9 meses.

UPDATE vacina
SET idade_minima_meses = 9
WHERE codigo_pni = 'FA_CRI';

-- ============================================================
-- 2) Backfill: numero_dose e tipo_dose nas 18 vacinas atuais
-- ============================================================

UPDATE vacina SET numero_dose = 1, tipo_dose = 'UNICA'    WHERE codigo_pni = 'BCG_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'HEPB_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'PENTA_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'VIP_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'PNEUMO10_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'ROTAV_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'MENINGOC_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'INFLU_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'COVID19_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'FA_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'REFORCO'  WHERE codigo_pni = 'MENACWY_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'TVIRAL_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'REFORCO'  WHERE codigo_pni = 'DTP_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'VARICELA_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'UNICA'    WHERE codigo_pni = 'HEPA_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'PNEUMO23_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'PRIMARIA' WHERE codigo_pni = 'DT_CRI';
UPDATE vacina SET numero_dose = 1, tipo_dose = 'UNICA'    WHERE codigo_pni = 'HPV4_CRI';

-- ============================================================
-- 3) Doses faltantes (15 novas linhas)
-- ============================================================

INSERT INTO vacina (
  ativa, codigo_pni, nome, descricao, dose, via_administracao,
  tipo_secao_vacinacao, idade_minima_meses, idade_maxima_meses,
  numero_dose, tipo_dose
) VALUES
  -- 4 meses
  (true, 'PENTA_CRI_D2',    'Penta (DTP+Hib+HB)',
   'Pentavalente: protege contra difteria, tetano, coqueluche, Haemophilus influenzae B e hepatite B. 2a dose aos 4 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 4, 119, 2, 'PRIMARIA'),

  (true, 'VIP_CRI_D2',      'VIP (Poliomielite Inativada)',
   'Vacina inativada contra a paralisia infantil. 2a dose aos 4 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 4, 119, 2, 'PRIMARIA'),

  (true, 'PNEUMO10_CRI_D2', 'Pneumococica 10-valente',
   'Protege contra doencas invasivas por dez sorotipos do pneumococo. 2a dose aos 4 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 4, 119, 2, 'PRIMARIA'),

  (true, 'ROTAV_CRI_D2',    'Rotavirus Humano',
   'Vacina oral contra a gastroenterite grave por rotavirus. 2a dose entre 3m15d e 7m29d (prazo improrrogavel).',
   '1,5 mL', 'Oral',          'CRIANCA', 3, 7,   2, 'PRIMARIA'),

  -- 5 meses
  (true, 'MENINGOC_CRI_D2', 'Meningococica C (Conjugada)',
   'Vacina conjugada contra a doenca meningococica pelo sorogrupo C. 2a dose aos 5 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 5, 119, 2, 'PRIMARIA'),

  -- 6 meses
  (true, 'PENTA_CRI_D3',    'Penta (DTP+Hib+HB)',
   'Pentavalente: protege contra difteria, tetano, coqueluche, Haemophilus influenzae B e hepatite B. 3a dose aos 6 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 6, 119, 3, 'PRIMARIA'),

  (true, 'VIP_CRI_D3',      'VIP (Poliomielite Inativada)',
   'Vacina inativada contra a paralisia infantil. 3a dose aos 6 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 6, 119, 3, 'PRIMARIA'),

  -- 7 meses
  (true, 'COVID19_CRI_D2',  'Covid-19 (pediatrica)',
   'Vacina contra formas graves e obitos por SARS-CoV-2. 2a dose aos 7 meses (esquema 2 ou 3 doses, varia por fabricante).',
   '0,25 mL ou 0,3 mL', 'Intramuscular', 'CRIANCA', 7, 119, 2, 'PRIMARIA'),

  -- 9 meses
  (true, 'COVID19_CRI_D3',  'Covid-19 (pediatrica)',
   'Vacina contra formas graves e obitos por SARS-CoV-2. 3a dose aos 9 meses (esquema Comirnaty).',
   '0,25 mL ou 0,3 mL', 'Intramuscular', 'CRIANCA', 9, 119, 3, 'PRIMARIA'),

  -- 12 meses
  (true, 'PNEUMO10_CRI_R1', 'Pneumococica 10-valente',
   'Reforco da pneumococica 10-valente aos 12 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 12, 119, 1, 'REFORCO'),

  -- 15 meses
  (true, 'VIP_CRI_R1',      'VIP (Poliomielite Inativada)',
   '1o reforco da poliomielite inativada aos 15 meses.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 15, 119, 1, 'REFORCO'),

  (true, 'TVIRAL_CRI_D2',   'Triplice Viral (SCR)',
   'Vacina contra sarampo, caxumba e rubeola. 2a dose aos 15 meses (pode ser feita como Tetra Viral em coadministracao com varicela).',
   '0,5 mL', 'Subcutanea',    'CRIANCA', 15, 119, 2, 'PRIMARIA'),

  -- 4 anos (48 meses)
  (true, 'DTP_CRI_R2',      'DTP (Triplice Bacteriana)',
   '2o reforco da DTP aos 4 anos.',
   '0,5 mL', 'Intramuscular', 'CRIANCA', 48, 119, 2, 'REFORCO'),

  (true, 'FA_CRI_R1',       'Febre Amarela',
   'Reforco da vacina contra febre amarela aos 4 anos.',
   '0,5 mL', 'Subcutanea',    'CRIANCA', 48, 119, 1, 'REFORCO'),

  (true, 'VARICELA_CRI_D2', 'Varicela',
   'Vacina contra catapora. 2a dose aos 4 anos.',
   '0,5 mL', 'Subcutanea',    'CRIANCA', 48, 119, 2, 'PRIMARIA')
ON CONFLICT (codigo_pni) DO NOTHING;

-- ============================================================
-- 4) Conferencias
-- ============================================================

-- Total CRIANCA: esperado 33 (18 originais + 15 novos)
SELECT COUNT(*) AS total_crianca
FROM vacina
WHERE tipo_secao_vacinacao = 'CRIANCA';

-- Backfill completo: esperado 0, 0
SELECT
  COUNT(*) FILTER (WHERE numero_dose IS NULL) AS sem_numero_dose,
  COUNT(*) FILTER (WHERE tipo_dose IS NULL)   AS sem_tipo_dose
FROM vacina
WHERE tipo_secao_vacinacao = 'CRIANCA';

-- Lista final por idade para conferencia visual
SELECT idade_minima_meses AS idade_m, codigo_pni, nome,
       numero_dose, tipo_dose
FROM vacina
WHERE tipo_secao_vacinacao = 'CRIANCA'
ORDER BY idade_minima_meses, nome, numero_dose;

COMMIT;
