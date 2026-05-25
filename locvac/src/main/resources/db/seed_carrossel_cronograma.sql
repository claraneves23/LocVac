-- ============================================================
-- Seed: Conteudo completo do slide "Cronograma de Vacinacao"
-- Fonte: https://www.gov.br/saude/pt-br/vacinacao/calendario
-- Cobre os 5 grupos do calendario PNI:
--   Crianca, Adolescente, Adulto, Idoso e Gestante.
-- ============================================================
-- Idempotente: apaga as secoes/bullets atuais do slide e
-- reinsere o conteudo completo.
--
-- Como rodar:
--   psql "$DATABASE_URL" -f locvac/src/main/resources/db/seed_carrossel_cronograma.sql
-- ============================================================

SET client_encoding = 'UTF8';

BEGIN;

DO $$
DECLARE
  v_id_item     BIGINT;
  v_id_conteudo BIGINT;
BEGIN
  -- localiza o slide pelo titulo
  SELECT id_item INTO v_id_item
  FROM carrossel_item
  WHERE titulo ILIKE 'Cronograma%'
  ORDER BY ordem_exibicao
  LIMIT 1;

  IF v_id_item IS NULL THEN
    RAISE EXCEPTION 'Slide "Cronograma..." nao encontrado em carrossel_item';
  END IF;

  -- limpa secoes e bullets existentes do slide
  DELETE FROM carrossel_conteudo_item
  WHERE id_conteudo IN (
    SELECT id_conteudo FROM carrossel_conteudo WHERE id_item = v_id_item
  );
  DELETE FROM carrossel_conteudo WHERE id_item = v_id_item;

  -- ============================================================
  -- CRIANCA (0 a 9 anos)
  -- ============================================================

  -- 1) Ao nascer
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'Ao nascer',
          'Vacinas aplicadas ainda na maternidade.', 1)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'BCG (dose única) — previne formas graves da tuberculose'),
    (v_id_conteudo, 1, 'Hepatite B (1ª dose) — primeiras 12 horas de vida');

  -- 2) 2 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '2 meses',
          'Início do esquema básico de vacinação.', 2)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Pentavalente DTP+Hib+HB (1ª dose) — difteria, tétano, coqueluche, Hib e hepatite B'),
    (v_id_conteudo, 1, 'VIP — Poliomielite inativada (1ª dose)'),
    (v_id_conteudo, 2, 'Pneumocócica 10-valente (1ª dose)'),
    (v_id_conteudo, 3, 'Rotavírus humano (1ª dose) — janela entre 1m15d e 3m15d');

  -- 3) 3 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '3 meses',
          'Proteção contra a doença meningocócica C.', 3)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Meningocócica C — conjugada (1ª dose)');

  -- 4) 4 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '4 meses',
          'Continuação do esquema básico.', 4)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Pentavalente DTP+Hib+HB (2ª dose)'),
    (v_id_conteudo, 1, 'VIP — Poliomielite inativada (2ª dose)'),
    (v_id_conteudo, 2, 'Pneumocócica 10-valente (2ª dose)'),
    (v_id_conteudo, 3, 'Rotavírus humano (2ª dose) — limite final aos 7m29d');

  -- 5) 5 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '5 meses',
          'Segunda dose da meningocócica C.', 5)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Meningocócica C — conjugada (2ª dose)');

  -- 6) 6 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '6 meses',
          'Conclusão do esquema básico de várias vacinas.', 6)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Pentavalente DTP+Hib+HB (3ª dose)'),
    (v_id_conteudo, 1, 'VIP — Poliomielite inativada (3ª dose)'),
    (v_id_conteudo, 2, 'Influenza trivalente (1ª dose) — anual, primovacinação requer 2 doses com 30 dias de intervalo'),
    (v_id_conteudo, 3, 'Covid-19 pediátrica (1ª dose) — esquema completo varia por fabricante');

  -- 7) 6 a 8 meses (excepcional)
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '6 a 8 meses (excepcional)',
          'Apenas em áreas de transmissão ativa de febre amarela ou para viajantes.', 7)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Febre amarela (dose excepcional) — aplicar pelo menos 10 dias antes da viagem');

  -- 8) 7 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '7 meses',
          'Continuação do esquema covid-19.', 8)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Covid-19 pediátrica (2ª dose)');

  -- 9) 9 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '9 meses',
          'Vacina contra febre amarela e finalização do esquema covid-19 (quando aplicável).', 9)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Febre amarela (1ª dose)'),
    (v_id_conteudo, 1, 'Covid-19 pediátrica (3ª dose) — esquema Comirnaty');

  -- 10) 12 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '12 meses',
          'Reforços e novas vacinas no primeiro ano.', 10)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Pneumocócica 10-valente (reforço)'),
    (v_id_conteudo, 1, 'Meningocócica ACWY (dose única no esquema infantil)'),
    (v_id_conteudo, 2, 'Tríplice viral SCR (1ª dose) — sarampo, caxumba e rubéola');

  -- 11) 15 meses
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '15 meses',
          'Reforços importantes e novas vacinas.', 11)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'DTP (1º reforço) — difteria, tétano, coqueluche'),
    (v_id_conteudo, 1, 'VIP — Poliomielite inativada (1º reforço)'),
    (v_id_conteudo, 2, 'Tríplice viral SCR (2ª dose)'),
    (v_id_conteudo, 3, 'Varicela (1ª dose) — pode ser feita como Tetra Viral'),
    (v_id_conteudo, 4, 'Hepatite A (dose única)');

  -- 12) 4 anos
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '4 anos',
          'Reforços ao final da pré-escola.', 12)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'DTP (2º reforço) — depois, manter dT a cada 10 anos'),
    (v_id_conteudo, 1, 'Febre amarela (reforço)'),
    (v_id_conteudo, 2, 'Varicela (2ª dose)');

  -- 13) 5 anos (povos indígenas)
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '5 anos (povos indígenas)',
          'Indicada para povos indígenas sem histórico de pneumo conjugada.', 13)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Pneumocócica 23-valente (1ª dose) — 2ª dose após 5 anos');

  -- 14) A partir dos 7 anos
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'A partir dos 7 anos',
          'Completar esquema em atraso ou aplicar reforços.', 14)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'dT — dupla adulto (3 doses conforme histórico vacinal)'),
    (v_id_conteudo, 1, 'Manter 1 reforço com dT a cada 10 anos');

  -- ============================================================
  -- ADOLESCENTE (9 a 19 anos)
  -- ============================================================

  -- 15) 9 a 14 anos (HPV)
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, '9 a 14 anos',
          'Prevenção contra o papilomavírus humano.', 15)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'HPV4 quadrivalente (dose única) — meninas e meninos');

  -- 16) Adolescentes (10 a 19 anos) — atualização da caderneta
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'Adolescentes (10 a 19 anos)',
          'Atualização da caderneta vacinal e novas vacinas previstas para a faixa etária.', 16)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Hepatite B — 3 doses se sem comprovação anterior'),
    (v_id_conteudo, 1, 'Meningocócica ACWY — dose única dos 11 aos 14 anos'),
    (v_id_conteudo, 2, 'Febre amarela — dose única se nunca recebida (em áreas de risco)'),
    (v_id_conteudo, 3, 'Tríplice viral SCR — atualizar para 2 doses'),
    (v_id_conteudo, 4, 'dT (dupla adulto) — completar esquema e reforço a cada 10 anos'),
    (v_id_conteudo, 5, 'Influenza — anual em grupos prioritários'),
    (v_id_conteudo, 6, 'Covid-19 — conforme situação vacinal');

  -- ============================================================
  -- ADULTO (20 a 59 anos)
  -- ============================================================

  -- 17) Adultos (20 a 59 anos)
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'Adultos (20 a 59 anos)',
          'Manutenção da proteção e vacinas específicas para a faixa etária adulta.', 17)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'dT (dupla adulto) — reforço a cada 10 anos'),
    (v_id_conteudo, 1, 'Hepatite B — 3 doses se nunca vacinado'),
    (v_id_conteudo, 2, 'Tríplice viral SCR — 2 doses até 29 anos; 1 dose dos 30 aos 59 anos'),
    (v_id_conteudo, 3, 'Febre amarela — dose única (em áreas com recomendação)'),
    (v_id_conteudo, 4, 'Influenza — anual em grupos prioritários'),
    (v_id_conteudo, 5, 'Covid-19 — conforme situação vacinal e grupos prioritários'),
    (v_id_conteudo, 6, 'HPV — em situações especiais (imunocomprometidos até 45 anos)');

  -- ============================================================
  -- IDOSO (60 anos ou mais)
  -- ============================================================

  -- 18) Idosos (60 anos ou mais)
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'Idosos (60 anos ou mais)',
          'Vacinas com proteção reforçada para o público idoso.', 18)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'Influenza — dose anual (campanha)'),
    (v_id_conteudo, 1, 'Pneumocócica 23-valente — em situações especiais (institucionalizados, comorbidades)'),
    (v_id_conteudo, 2, 'dT (dupla adulto) — reforço a cada 10 anos'),
    (v_id_conteudo, 3, 'Hepatite B — 3 doses se nunca vacinado'),
    (v_id_conteudo, 4, 'Febre amarela — dose única (em áreas com recomendação)'),
    (v_id_conteudo, 5, 'Covid-19 — reforço periódico conforme orientação atual');

  -- ============================================================
  -- GESTANTE
  -- ============================================================

  -- 19) Gestantes
  INSERT INTO carrossel_conteudo (id_item, titulo_secao, conteudo, ordem_exibicao)
  VALUES (v_id_item, 'Gestantes',
          'Vacinas seguras durante a gestação que protegem mãe e bebê.', 19)
  RETURNING id_conteudo INTO v_id_conteudo;
  INSERT INTO carrossel_conteudo_item (id_conteudo, ordem, item) VALUES
    (v_id_conteudo, 0, 'dTpa (tríplice bacteriana acelular adulto) — 1 dose a partir da 20ª semana de cada gestação'),
    (v_id_conteudo, 1, 'Hepatite B — 3 doses se ainda não tomou'),
    (v_id_conteudo, 2, 'Influenza — em qualquer fase da gestação'),
    (v_id_conteudo, 3, 'Covid-19 — esquema completo, incluindo reforço quando indicado'),
    (v_id_conteudo, 4, 'Tríplice viral SCR — contraindicada na gestação (aguardar pós-parto)'),
    (v_id_conteudo, 5, 'Febre amarela — geralmente contraindicada; avaliar risco-benefício');

END $$;

-- ============================================================
-- Conferencia
-- ============================================================
SELECT cc.ordem_exibicao AS ordem,
       cc.titulo_secao   AS secao,
       COUNT(cci.item)   AS bullets
FROM carrossel_conteudo cc
LEFT JOIN carrossel_conteudo_item cci ON cci.id_conteudo = cc.id_conteudo
WHERE cc.id_item = (
  SELECT id_item FROM carrossel_item
  WHERE titulo ILIKE 'Cronograma%'
  ORDER BY ordem_exibicao LIMIT 1
)
GROUP BY cc.ordem_exibicao, cc.titulo_secao
ORDER BY cc.ordem_exibicao;
-- esperado: 19 secoes

COMMIT;
