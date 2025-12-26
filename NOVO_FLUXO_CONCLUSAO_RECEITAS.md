# 🎯 Novo Fluxo de Conclusão de Receitas (3 Etapas)

**Baseado no briefing:** `chekin.txt`

## 📋 Resumo

Implementação completa do novo sistema de conclusão de receitas que elimina a paralisia de decisão através de um fluxo progressivo em 3 etapas.

### 🎯 Objetivo

Separar a conclusão simples do engajamento detalhado, permitindo que o usuário complete receitas rapidamente e depois, opcionalmente, adicione mais informações para ganhar pontos extras.

### ⚡ Problema Resolvido

- ❌ **Antes:** Usuário enfrenta dupla decisão simultânea (rápida vs completa)
- ✅ **Agora:** Fluxo progressivo natural sem fricção

---

## 🏗️ Arquitetura do Sistema

### **ETAPA 1: Ação Primária**
**Arquivo:** `src/components/recipe-completion/RecipeCompletionButton.tsx`

- Botão único "Finalizar Receita"
- SEM menção a pontos (evita paralisia)
- Ao clicar: salva conclusão + 5 pontos + navega para Etapa 2

### **ETAPA 2: Confirmação e Micro-Vitória**
**Arquivo:** `src/components/recipe-completion/RecipeCompletionConfirmation.tsx`

- Tela de celebração com animação (confetti)
- Mostra "+5 pontos" como reforço emocional
- Auto-avança para Etapa 3 após 2 segundos
- Não permite voltar (previne duplicatas)

### **ETAPA 3: Engajamento Progressivo**
**Arquivo:** `src/app/(app)/recipe/[id]/engagement/page.tsx`

- Tela com 3 seções opcionais:
  - ⭐ **Avaliação** (5★ pré-selecionadas) → +10 pontos
  - 📷 **Foto** → +10 pontos
  - 💬 **Comentário** (mín 20 chars) → +10 pontos
- Auto-save incremental
- CTA dinâmico mostra pontos ganhos
- Sempre habilitado (nunca disabled)

---

## 📁 Estrutura de Arquivos Criados

### **Backend**

```
supabase/migrations/
├── 20250123_recipe_completion_flow.sql    # Migration completa

src/types/
├── recipe-completion.ts                    # Tipos TypeScript

src/lib/services/
├── recipe-completion.service.ts            # Serviços (completeRecipe, updateEngagement, etc)

src/hooks/
├── useRecipeCompletion.ts                  # Hooks React Query
```

### **Frontend**

```
src/components/recipe-completion/
├── index.ts                                # Exports
├── RecipeCompletionButton.tsx              # Botão Etapa 1
├── RecipeCompletionConfirmation.tsx        # Tela Etapa 2
├── StarRating.tsx                          # Componente de avaliação
├── PhotoPicker.tsx                         # Componente de foto
└── ProgressBar.tsx                         # Barra de progresso

src/app/(app)/recipe/[id]/engagement/
└── page.tsx                                # Página Etapa 3
```

---

## 🔧 Como Usar

### 1. **Aplicar Migration no Supabase**

```bash
# Via Supabase CLI
supabase migration up

# OU via Dashboard Supabase
# Copie o conteúdo de 20250123_recipe_completion_flow.sql
# Cole em SQL Editor e execute
```

### 2. **Integrar na Página de Receita**

```tsx
// Exemplo: src/app/(app)/recipe/[id]/page.tsx

import { RecipeCompletionButton } from '@/components/recipe-completion'
import { useCompleteRecipe, useHasCompletedRecipe } from '@/hooks/useRecipeCompletion'
import { useState } from 'react'
import { RecipeCompletionConfirmation } from '@/components/recipe-completion'

export default function RecipePage({ params }: { params: { id: string } }) {
  const { data: hasCompleted } = useHasCompletedRecipe(params.id)
  const completeRecipe = useCompleteRecipe()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [completionId, setCompletionId] = useState<string | null>(null)

  const handleComplete = async () => {
    const completion = await completeRecipe.mutateAsync(params.id)
    if (completion) {
      setCompletionId(completion.id)
      setShowConfirmation(true)
    }
  }

  return (
    <div>
      {/* Conteúdo da receita */}

      {/* Botão de conclusão (só aparece se NÃO completou) */}
      {!hasCompleted && (
        <RecipeCompletionButton
          recipeId={params.id}
          onComplete={handleComplete}
          loading={completeRecipe.isPending}
        />
      )}

      {/* Modal de confirmação (Etapa 2) */}
      {completionId && (
        <RecipeCompletionConfirmation
          recipeId={params.id}
          completionId={completionId}
          basePoints={5}
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  )
}
```

---

## 📊 Schema do Banco de Dados

### **Tabela: recipe_completions**

```sql
CREATE TABLE recipe_completions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Engajamento (nullable)
  rating INTEGER,
  photo_url TEXT,
  comment TEXT,
  comment_length INTEGER,

  -- Pontos
  base_points INTEGER DEFAULT 5,
  rating_points INTEGER DEFAULT 0,
  photo_points INTEGER DEFAULT 0,
  comment_points INTEGER DEFAULT 0,
  total_points INTEGER GENERATED ALWAYS AS (...) STORED,

  -- Metadados
  engagement_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  UNIQUE(user_id, recipe_id)
);
```

### **Tabela: points_transactions**

```sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  source TEXT NOT NULL,  -- 'recipe_completion', 'recipe_engagement'
  reference_id UUID,     -- ID do recipe_completion
  created_at TIMESTAMPTZ
);
```

### **Função RPC: add_user_points**

```sql
CREATE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source TEXT,
  p_reference_id UUID
) RETURNS void AS $$
BEGIN
  -- Adiciona pontos ao usuário
  UPDATE users SET total_points = COALESCE(total_points, 0) + p_points
  WHERE id = p_user_id;

  -- Registra transação
  INSERT INTO points_transactions (...) VALUES (...);
END;
$$ LANGUAGE plpgsql;
```

---

## 🎮 Sistema de Pontuação

| Ação | Pontos | Etapa |
|------|--------|-------|
| Completar receita | +5 | Etapa 1 & 2 |
| Avaliar (rating) | +10 | Etapa 3 |
| Adicionar foto | +10 | Etapa 3 |
| Comentar (20+ chars) | +10 | Etapa 3 |
| **TOTAL MÁXIMO** | **35** | - |

---

## 📈 Métricas de Sucesso

### **KPIs Primários**

1. **Taxa de Conclusão**
   - Antes vs Depois
   - Meta: +15% de aumento

2. **Taxa de Engajamento Completo**
   - Usuários que preenchem todos os 3 campos
   - Meta: 20%+

3. **Distribuição de Pontos**
   - 5 pontos (só conclusão)
   - 15 pontos (conclusão + 1 item)
   - 25 pontos (conclusão + 2 itens)
   - 35 pontos (conclusão + todos)

### **Queries de Analytics**

```sql
-- Taxa de conclusão geral
SELECT
  COUNT(DISTINCT recipe_id) as recipes_viewed,
  COUNT(DISTINCT CASE WHEN completed_at IS NOT NULL THEN recipe_id END) as recipes_completed,
  (COUNT(DISTINCT CASE WHEN completed_at IS NOT NULL THEN recipe_id END)::FLOAT /
   COUNT(DISTINCT recipe_id) * 100) as completion_rate
FROM recipe_views
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Distribuição de pontos
SELECT
  total_points,
  COUNT(*) as count,
  (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () * 100) as percentage
FROM recipe_completions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY total_points
ORDER BY total_points;

-- Taxa de engajamento completo
SELECT
  COUNT(*) FILTER (WHERE rating IS NOT NULL) as with_rating,
  COUNT(*) FILTER (WHERE photo_url IS NOT NULL) as with_photo,
  COUNT(*) FILTER (WHERE comment IS NOT NULL) as with_comment,
  COUNT(*) FILTER (WHERE
    rating IS NOT NULL AND
    photo_url IS NOT NULL AND
    comment IS NOT NULL
  ) as full_engagement,
  COUNT(*) as total_completions
FROM recipe_completions
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## ✅ Checklist de Implementação

- [x] FASE 1 - Backend
  - [x] Migration SQL criada
  - [x] Função RPC add_user_points
  - [x] Tipos TypeScript
  - [x] Services (completeRecipe, updateEngagement, getEngagementProgress)
  - [x] Hooks React Query

- [x] FASE 2 - UI Básica
  - [x] RecipeCompletionButton
  - [x] RecipeCompletionConfirmation
  - [x] Navegação entre etapas

- [x] FASE 3 - Engajamento
  - [x] Componentes auxiliares (StarRating, PhotoPicker, ProgressBar)
  - [x] Tela de engajamento
  - [x] Auto-save incremental
  - [x] CTA dinâmico

- [ ] FASE 4 - Polimento
  - [ ] Animações refinadas
  - [ ] Testes de performance
  - [ ] Testes de acessibilidade
  - [ ] Setup de analytics

- [ ] FASE 5 - Deploy
  - [ ] Aplicar migration em produção
  - [ ] Integrar em todas as páginas de receitas
  - [ ] Monitorar métricas
  - [ ] A/B testing (se aplicável)

---

## 🔄 Migração do Sistema Antigo

Se você está vindo do sistema antigo (`recipe_check_ins`), não há necessidade de migrar dados. Os dois sistemas podem coexistir:

- **Sistema antigo:** `recipe_check_ins` (continua funcionando)
- **Sistema novo:** `recipe_completions` (novo fluxo)

Para desativar o sistema antigo gradualmente:

1. Implemente o novo fluxo em algumas páginas (A/B test)
2. Compare métricas
3. Se positivo, migre 100% das páginas
4. Eventualmente deprecie `recipe_check_ins`

---

## 🐛 Troubleshooting

### **Erro: "add_user_points function not found"**

**Solução:** Verifique se a migration foi aplicada corretamente:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'add_user_points';
```

### **Erro: "recipe_completions table does not exist"**

**Solução:** Aplique a migration:

```bash
supabase migration up
```

### **Navegação não redireciona para /engagement**

**Solução:** Verifique se a rota existe em `src/app/(app)/recipe/[id]/engagement/page.tsx`

---

## 📚 Referências

- **Briefing Original:** `chekin.txt`
- **Migration SQL:** `supabase/migrations/20250123_recipe_completion_flow.sql`
- **Tipos:** `src/types/recipe-completion.ts`
- **Services:** `src/lib/services/recipe-completion.service.ts`
- **Hooks:** `src/hooks/useRecipeCompletion.ts`

---

## 🎉 Conclusão

O novo fluxo de conclusão de receitas está completo e pronto para uso! Siga o checklist de implementação para integrar nas suas páginas.

**Próximos Passos:**

1. Aplicar migration no Supabase
2. Integrar componentes nas páginas de receitas
3. Monitorar métricas de engajamento
4. Iterar baseado em feedback dos usuários

Bom desenvolvimento! 🚀
