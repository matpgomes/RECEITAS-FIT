-- =============================================
-- 🗑️  REMOVER TABELAS REDUNDANTES
-- =============================================
--
-- MOTIVO: As tabelas ingredient_packages e unit_conversions
-- são redundantes porque a IA (Claude via N8N) já faz:
--   ✅ Conversões de unidades (xícara → gramas)
--   ✅ Sugestões de embalagens reais
--   ✅ Consolidação de ingredientes
--   ✅ Otimização de compras
--
-- IMPACTO: Nenhum! Essas tabelas não são usadas no código atual.
--
-- =============================================

-- 1️⃣  Remover RLS Policies
DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages;
DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions;

-- 2️⃣  Remover Índices
DROP INDEX IF EXISTS idx_packages_ingredient;
DROP INDEX IF EXISTS idx_packages_default;

-- 3️⃣  Remover Tabelas (CASCADE para limpar dependências)
DROP TABLE IF EXISTS ingredient_packages CASCADE;
DROP TABLE IF EXISTS unit_conversions CASCADE;

-- ✅ PRONTO! As tabelas foram removidas com sucesso.
--
-- O sistema agora está mais simples e a IA faz todo o trabalho
-- de conversão e sugestão de embalagens.
