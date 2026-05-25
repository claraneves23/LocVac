-- ============================================================
-- Define o template do slide "Cronograma de Vacinacao"
-- ============================================================
-- Pre-requisito: coluna `template` ja deve existir em
-- carrossel_item (criada pelo Hibernate apos deploy do backend
-- com o novo campo na entidade CarrosselItem).
--
-- Como rodar:
--   psql "$DATABASE_URL" -f locvac/src/main/resources/db/set_template_cronograma.sql
-- ============================================================

SET client_encoding = 'UTF8';

BEGIN;

UPDATE carrossel_item
SET template = 'cronograma'
WHERE titulo ILIKE 'Cronograma%';

-- conferencia
SELECT id_item, titulo, template, ordem_exibicao
FROM carrossel_item
ORDER BY ordem_exibicao;

COMMIT;
