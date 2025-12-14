# Features Principais

## 1. Autenticação e Onboarding

### Login/Cadastro
- Cadastro com email e senha via Supabase Auth
- Login com email e senha
- Trial de 7 dias automático após cadastro
- Validação com Zod

### Onboarding (3 Etapas)
**Etapa 1 - Vamos Conhecer Você:**
- Nome
- Idade (18-120)
- Altura em cm (100-250)
- Peso atual em kg (30-300)
- Peso meta em kg (30-300)

**Etapa 2 - Seu Corpo e Hábitos:**
- Sexo biológico (feminino/masculino)
- Nível de atividade física
- Condições de saúde
- Objetivo principal (perda rápida/saudável/energia/saúde)
- Refeições caseiras por semana

**Etapa 3 - Quase Lá:**
- Medidas (cintura e quadril)
- Padrão de mudança de peso
- Histórico de dietas restritivas
- Tempo tentando perder peso
- Alergias alimentares

**Cálculos Automáticos:**
- IMC (Índice de Massa Corporal)
- TMB (Taxa Metabólica Basal)
- Idade metabólica
- % de gordura corporal
- Calorias diárias recomendadas

## 2. Home e Calendário

### Receita do Dia
- Exibição destacada da receita programada para hoje
- Informações resumidas: tempo, calorias, porções

### Calendário Mensal
- Visualização de todo o mês
- Receitas programadas automaticamente
- Possibilidade de substituir receitas
- Indicador visual do dia atual
- Navegação entre meses

### Quick Actions
- Botão para ver todas as receitas
- Botão para lista de compras

## 3. Receitas

### Listagem
- Grid de cards de receitas
- Busca por nome/descrição/tags
- Filtros por categoria (Café da Manhã, Almoço, Jantar, Sobremesas)
- Sistema de favoritos
- Informações em cada card:
  - Imagem
  - Título e descrição
  - Tempo de preparo
  - Calorias (fit e economizadas)
  - Tags
  - Categoria

### Detalhes da Receita (Slider 3 Slides)

**Slide 1 - Ingredientes:**
- Lista completa de ingredientes
- Quantidade para X porções
- Notas especiais (substituições)

**Slide 2 - Modo de Preparo:**
- Texto completo do preparo
- Instruções narrativas

**Slide 3 - Passo a Passo:**
- Steps individuais
- Título de cada passo
- Descrição detalhada
- Tempo estimado por passo
- Navegação entre passos
- Progress bar

### Funcionalidades
- Favoritar/Desfavoritar
- Adicionar ao calendário
- Ajuste de porções (futuro)
- Botão "Começar Receita" que leva ao passo a passo

## 4. Check-in (Fase 4 - Futuro)

- Upload de foto da receita preparada
- Rating de 1-5 estrelas
- Comentário opcional
- Sistema de pontos por check-in
- Moderação de fotos antes de publicar

## 5. Lista de Compras (Fase 5 - Futuro)

- Seleção de múltiplas receitas
- Consolidação inteligente de ingredientes via IA (Claude API + N8n)
- Agrupamento por categorias
- Exportação em PDF
- Checkbox para marcar itens comprados

## 6. Perfil e Dashboard (Fase 6 - Futuro)

### Métricas
- Peso atual
- IMC
- Idade metabólica vs idade real
- Progresso para meta
- Total de pontos

### Gráficos
- Evolução de peso (Recharts)
- Histórico de check-ins

### Ações
- Editar perfil
- Registrar novo peso
- Ver badges conquistados

## 7. Gamificação (Fase 7 - Futuro)

### Sistema de Pontos
- 10 pontos por check-in aprovado
- Bônus por sequências (streaks)

### Badges
- "Primeira Receita"
- "10 Check-ins"
- "Semana Perfeita" (7 dias seguidos)
- "Chef Fit" (50 receitas diferentes)
- "Perda de 5kg"
- Entre outros

### Ranking
- Top 10 usuários da comunidade
- Baseado em pontos totais
- Atualizado semanalmente

## 8. PWA (Fase 8 - Futuro)

- Manifest.json configurado
- Service Worker para cache
- Instalável no dispositivo
- Funcionalidade offline básica
- Ícones em diferentes tamanhos
