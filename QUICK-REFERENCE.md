# QUICK REFERENCE - Receitas FIT PWA

> **Última atualização:** 26/11/2024
> **Versão:** 0.4.0
> **Progresso:** 75% completo
> **Próxima meta:** Seed de Receitas + Lista de Compras com IA

---

## 🗄️ BANCO DE DADOS (Supabase)

### Projeto Supabase
- **Project ID:** `msdiusqprtqlyydxyccf`
- **Project Ref:** `msdiusqprtqlyydxyccf`
- **Region:** `sa-east-1`
- **URL:** `https://msdiusqprtqlyydxyccf.supabase.co`

### Tabelas Criadas ✅

| Tabela | Status | Migration | Descrição |
|--------|--------|-----------|-----------|
| `users` | ✅ Ativa | 001 | Usuários, trial, assinatura, pontos |
| `user_profiles` | ✅ Ativa | 002 | Perfil completo do onboarding |
| `recipes` | ✅ Ativa | 003 | Receitas do app |
| `user_favorite_recipes` | ✅ Ativa | 004 | Receitas favoritadas |
| `user_selected_recipes` | ✅ Ativa | 004 | Receitas selecionadas por data |
| `weight_logs` | ✅ Ativa | 005 | Histórico de peso |
| `check_ins` | ✅ Ativa | 006 | Check-ins de receitas |

### Storage Buckets ✅

| Bucket | Status | Público | Descrição |
|--------|--------|---------|-----------|
| `check-in-photos` | ✅ Ativo | Sim | Fotos de check-in |

---

## 📁 ESTRUTURA DE ARQUIVOS IMPORTANTES

### Backend & Database
```
supabase/
├── migrations/
│   ├── 001_create_users.sql ✅
│   ├── 002_create_profiles.sql ✅
│   ├── 003_create_recipes.sql ✅
│   ├── 004_create_favorites_selected.sql ✅
│   ├── 005_create_weight_logs.sql ✅
│   └── 006_create_checkins.sql ✅
```

### Bibliotecas & Cálculos
```
src/lib/
├── calculations/
│   └── metrics.ts ✅ (IMC, TMB, TDEE, Gordura, Idade Metabólica)
├── supabase/
│   ├── client.ts ✅
│   ├── server.ts ✅
│   └── types.ts ✅
├── validations/
│   ├── auth.ts ✅
│   └── onboarding.ts ✅
└── utils.ts ✅
```

### Hooks Customizados
```
src/hooks/
├── useRecipes.ts ✅ (6 hooks: useRecipes, useRecipe, etc.)
└── useCheckIns.ts ✅ (5 funções: createCheckIn, deleteCheckIn, etc.)
```

### Páginas Principais
```
src/app/
├── (auth)/
│   ├── login/page.tsx ✅
│   └── signup/page.tsx ✅
├── (onboarding)/
│   └── onboarding/
│       ├── step-1/page.tsx ✅
│       ├── step-2/page.tsx ✅
│       ├── step-3/page.tsx ✅
│       └── results/page.tsx ✅
├── (app)/
│   ├── home/page.tsx ✅
│   ├── recipes/page.tsx ✅
│   ├── recipe/[id]/page.tsx ✅ (Slider 3 slides + ajuste porções)
│   ├── checkin/[recipeId]/page.tsx ✅ (Upload foto + rating)
│   ├── shopping-list/page.tsx ⚠️ (estrutura básica)
│   └── profile/page.tsx ⚠️ (estrutura básica)
├── paywall/page.tsx ✅
├── api/
│   └── onboarding/complete/route.ts ✅
└── middleware.ts ✅ (Proteção rotas + validação trial)
```

---

## 🔑 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Fase 0 - Setup (100%)
- Next.js 16.0.3 + React 19
- Supabase SSR configurado
- shadcn/ui (12 componentes)
- Tailwind CSS 4

### ✅ Fase 1 - Autenticação (100%)
- Signup/Login com Supabase Auth
- Trial de 7 dias automático
- Middleware de proteção de rotas
- Validação de trial expirado
- Página de paywall (R$ 29,90 mensal / R$ 19,90 anual)

### ✅ Fase 2 - Onboarding (100%)
- 3 etapas de cadastro completas
- Validação com Zod
- Store Zustand
- Cálculos de métricas de saúde:
  - IMC (Índice de Massa Corporal)
  - TMB/BMR (Taxa Metabólica Basal - Mifflin-St Jeor)
  - TDEE (Total Daily Energy Expenditure)
  - Percentual de Gordura Corporal (Navy method)
  - Idade Metabólica estimada
  - Calorias recomendadas por objetivo

### ✅ Fase 3 - Receitas (100%)
- Grid de receitas com busca/filtros
- Calendário scrollable (snap-to-center)
- Sistema de favoritos
- Seleção de receitas por data
- Página de detalhes completa:
  - Slider com 3 slides (Ingredientes, Preparo, Passo a Passo)
  - Ajuste de porções (1-20 pessoas)
  - Recálculo automático de ingredientes
  - Botões: Favoritar, Check-in, Lista de Compras

### ✅ Fase 4 - Check-in (100%)
- Upload de foto (câmera ou galeria)
- Preview antes do upload
- Sistema de avaliação (1-5 estrelas)
- Comentário opcional (max 300 chars)
- Moderação (pending/approved/rejected)
- Gamificação: +10 pontos quando aprovado
- RLS policies completas

---

## 🎯 FÓRMULAS DE CÁLCULO

### IMC (Body Mass Index)
```typescript
IMC = peso_kg / (altura_m²)

Classificação OMS:
- < 18.5: Abaixo do peso
- 18.5 - 24.9: Peso normal
- 25.0 - 29.9: Sobrepeso
- 30.0 - 34.9: Obesidade Grau I
- 35.0 - 39.9: Obesidade Grau II
- >= 40.0: Obesidade Grau III
```

### TMB/BMR (Mifflin-St Jeor)
```typescript
Mulheres: (10 × peso_kg) + (6.25 × altura_cm) - (5 × idade) - 161
Homens: (10 × peso_kg) + (6.25 × altura_cm) - (5 × idade) + 5
```

### TDEE (Total Daily Energy Expenditure)
```typescript
Sedentário: TMB × 1.2
Levemente ativo: TMB × 1.375
Moderadamente ativo: TMB × 1.55
Muito ativo: TMB × 1.725
```

### Percentual de Gordura Corporal (Navy Method)
```typescript
RCQ = cintura_cm / quadril_cm

Mulheres: (1.20 × IMC) + (0.23 × idade) - 5.4 + (RCQ × 10)
Homens: (1.20 × IMC) + (0.23 × idade) - 16.2 + (RCQ × 10)
```

### Idade Metabólica
```typescript
base = idade_cronológica

ajuste_imc:
  - IMC < 18.5: -2 anos
  - IMC 18.5-25: 0 anos
  - IMC 25-30: +3 anos
  - IMC >= 30: +7 anos

ajuste_atividade:
  - Sedentário: +5 anos
  - Levemente ativo: +2 anos
  - Moderadamente ativo: -1 ano
  - Muito ativo: -3 anos

idade_metabolica = base + ajuste_imc + ajuste_atividade
```

### Calorias Recomendadas
```typescript
Perda rápida: TDEE × 0.80 (-20%)
Perda saudável: TDEE × 0.85 (-15%)
Manutenção energética: TDEE × 0.95 (-5%)
Melhora de saúde: TDEE × 1.0 (sem ajuste)
```

---

## 🔒 RLS POLICIES

### Tabela `check_ins`
1. **INSERT**: Usuários podem criar seus próprios check-ins
2. **SELECT**: Usuários podem ver seus próprios check-ins
3. **SELECT**: Qualquer um pode ver check-ins aprovados

### Storage `check-in-photos`
1. **INSERT**: Usuários autenticados podem fazer upload em suas pastas
2. **SELECT**: Usuários podem ver suas próprias fotos
3. **SELECT**: Qualquer um pode visualizar fotos públicas

### Outras Tabelas
- `users`: SELECT/UPDATE apenas o próprio usuário
- `user_profiles`: SELECT/INSERT/UPDATE apenas o próprio perfil
- `recipes`: SELECT público (is_active = true)
- `user_favorite_recipes`: ALL apenas o próprio usuário
- `weight_logs`: SELECT/INSERT apenas o próprio usuário

---

## ⚡ TRIGGERS AUTOMÁTICOS

### 1. `handle_new_user()` - auth.users
- **Quando:** Após INSERT em auth.users (signup)
- **Ação:** Cria registro em public.users com trial de 7 dias

### 2. `update_updated_at_column()` - Várias tabelas
- **Quando:** Antes de UPDATE
- **Ação:** Atualiza campo updated_at

### 3. `update_current_weight()` - weight_logs
- **Quando:** Após INSERT em weight_logs
- **Ação:** Atualiza current_weight_kg no user_profiles

### 4. `award_checkin_points()` - check_ins
- **Quando:** Antes de UPDATE em check_ins (moderação)
- **Ação:** Se aprovado, adiciona 10 pontos ao usuário

---

## 🎨 COMPONENTES UI (shadcn/ui)

✅ Instalados (12):
- Button, Input, Label, Card, Tabs
- Toast (Sonner), Dialog, Checkbox
- Slider, Progress, Form, Textarea

---

## 📊 PRÓXIMOS PASSOS

### 🔴 Alta Prioridade
1. **Seed de Receitas** (4-6h)
   - Criar 30+ receitas reais
   - Categorizar por tipo de refeição
   - Informações nutricionais completas

2. **Lista de Compras com IA** (6-8h)
   - Migration 007_create_shopping_lists.sql
   - Hook useShoppingList
   - Integração N8n + Claude API
   - Consolidação de ingredientes
   - Exportação (PDF/WhatsApp/Email)

### 🟡 Média Prioridade
3. **Dashboard de Evolução** (8-10h)
   - Gráficos de peso (Recharts)
   - Evolução de idade metabólica
   - Estatísticas de check-ins
   - Registro de novo peso

4. **Integração Stripe** (6-8h)
   - Checkout mensal/anual
   - Webhooks para atualizar subscription_status
   - Portal de gerenciamento

### 🟢 Baixa Prioridade
5. **Gamificação Completa** (8-10h)
   - Migration 008_create_badges.sql
   - Sistema de conquistas
   - Ranking de usuários
   - Notificações de badges

6. **PWA Completo** (4-6h)
   - Service Worker
   - Modo offline
   - Cache de receitas
   - Instalabilidade

---

## 🐛 PROBLEMAS CONHECIDOS

### Nenhum problema crítico identificado! ✅

### Melhorias Futuras
- Filtros avançados de receitas (só categoria funciona)
- Dashboard admin de moderação de check-ins
- Notificações push para check-ins aprovados

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### Arquivos do Projeto
- `CURRENT-STATE.md` - Estado completo do projeto
- `IMPLEMENTACAO-26-11-2024.md` - Resumo da última sessão
- `ANALISE-PROJETO-COMPLETA.md` - Análise detalhada
- `ALINHAMENTO-PRD-PLANO.md` - Validação do plano
- `QUICK-REFERENCE.md` - Este arquivo (referência rápida)

### Anexos Técnicos
- `anexo_a_types.txt` - Todas as interfaces TypeScript
- `anexo_b_database_v2.txt` - Schema completo do banco
- `anexo_c_api.txt` - Contratos das APIs
- `master_plan.txt` - Plano de execução por fases

### Links Úteis
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

---

## 💡 COMANDOS ÚTEIS

### Desenvolvimento
```bash
cd "C:\Users\matpg\Downloads\RECEITAS FIT\receitas-fit-pwa"
npm run dev          # Iniciar dev server
npm run build        # Build de produção
npm run lint         # ESLint
```

### Supabase (via MCP)
```typescript
// Project ID correto
project_id: "msdiusqprtqlyydxyccf"

// Executar SQL
mcp__supabase__execute_sql({ project_id, query })

// Listar tabelas
mcp__supabase__list_tables({ project_id })
```

### shadcn/ui
```bash
npx shadcn@latest add [component-name]
```

---

**Este arquivo é atualizado após cada sessão de implementação significativa.**
