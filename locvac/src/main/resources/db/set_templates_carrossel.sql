-- ============================================================
-- Define os templates dos slides do carrossel
-- ============================================================
-- Pre-requisito: coluna `template` ja deve existir em
-- carrossel_item (criada pelo Hibernate apos deploy do backend
-- com o novo campo na entidade CarrosselItem).
--
-- Como rodar:
--   psql "$DATABASE_URL" -f locvac/src/main/resources/db/set_templates_carrossel.sql
-- ============================================================

SET client_encoding = 'UTF8';

BEGIN;

UPDATE carrossel_item SET template = 'cronograma'
 WHERE titulo ILIKE 'Cronograma%';

UPDATE carrossel_item SET template = 'efeitos_colaterais'
 WHERE titulo ILIKE 'Efeitos%';

UPDATE carrossel_item SET template = 'duvidas_frequentes'
 WHERE titulo ILIKE 'D%vidas%' OR titulo ILIKE 'FAQ%' OR titulo ILIKE 'Perguntas%';

-- conferencia
SELECT id_item, titulo, template, ordem_exibicao
FROM carrossel_item
ORDER BY ordem_exibicao;

COMMIT;
