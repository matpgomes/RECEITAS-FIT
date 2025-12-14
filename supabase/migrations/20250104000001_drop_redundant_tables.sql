-- =============================================
-- MIGRATION: Remover tabelas redundantes
-- Descrição: Remove ingredient_packages e unit_conversions pois a IA faz essas conversões
-- Motivo: Simplificar sistema - a IA (Claude) já faz conversões e sugestões de embalagens
-- =============================================

-- 1. Dropar policies RLS primeiro
DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages;
DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions;

-- 2. Dropar índices (se existirem)
DROP INDEX IF EXISTS idx_packages_ingredient;
DROP INDEX IF EXISTS idx_packages_default;

-- 3. Dropar as tabelas (CASCADE para remover dependências)
DROP TABLE IF EXISTS ingredient_packages CASCADE;
DROP TABLE IF EXISTS unit_conversions CASCADE;

-- 4. Comentário explicativo
COMMENT ON TABLE shopping_lists IS 'Lista de compras. As conversões de unidades e sugestões de embalagens são feitas pela IA (Claude via N8N), não por tabelas do banco.';
