# Fluxos de Usuário

## Fluxo 1: Primeiro Acesso (Novo Usuário)

1. Usuário acessa a aplicação
2. Vê tela de signup
3. Preenche email e senha
4. Clica em "Criar conta"
5. Trial de 7 dias é ativado automaticamente
6. Redirecionado para Onboarding Step 1
7. Preenche dados pessoais (nome, idade, altura, peso)
8. Avança para Step 2
9. Preenche hábitos e objetivos
10. Avança para Step 3
11. Preenche medidas e restrições
12. Vê tela de resultados com métricas calculadas
13. Redirecionado para Home

## Fluxo 2: Login (Usuário Retornando)

1. Usuário acessa a aplicação
2. Vê tela de login
3. Preenche email e senha
4. Clica em "Entrar"
5. Redirecionado para Home

## Fluxo 3: Visualizar Receita do Dia

1. Usuário está na Home
2. Vê card da "Receita de Hoje"
3. Clica no card
4. Redirecionado para detalhes da receita
5. Vê slide de ingredientes
6. Navega para slide de modo de preparo
7. Navega para passo a passo
8. Pode voltar para Home ou começar a receita

## Fluxo 4: Buscar e Favoritar Receita

1. Usuário clica em "Receitas" no menu inferior
2. Vê lista de todas as receitas
3. Usa busca para filtrar receitas
4. Ou seleciona uma categoria (Café, Almoço, Jantar, Sobremesas)
5. Encontra receita de interesse
6. Clica no ícone de coração para favoritar
7. Receita é adicionada aos favoritos
8. Pode ver seção "Minhas Favoritas" na mesma página

## Fluxo 5: Planejar Receitas no Calendário

1. Usuário está na Home
2. Vê calendário mensal
3. Vê que alguns dias já têm receitas programadas
4. Clica em um dia vazio
5. Redirecionado para lista de receitas com filtro de data
6. Seleciona uma receita
7. Receita é associada àquele dia
8. Volta para Home e vê receita no calendário

## Fluxo 6: Ver Detalhes e Fazer Receita

1. Usuário clica em uma receita (de qualquer lugar)
2. Vê página de detalhes
3. Lê informações gerais (tempo, porções, calorias)
4. Navega pelos 3 slides:
   - Ingredientes (anota o que precisa comprar)
   - Modo de preparo (lê instruções gerais)
   - Passo a passo (segue instruções detalhadas)
5. Clica em "Começar Receita"
6. Segue cada passo com timing
7. Ao final, pode fazer check-in (fase futura)

## Fluxo 7: Navegar pelo App

1. Usuário usa barra inferior (Menubar) para navegar
2. Pode ir para:
   - Home (calendário e receita do dia)
   - Receitas (buscar e explorar)
   - Lista (fase futura - lista de compras)
   - Perfil (fase futura - dashboard e métricas)
3. Navegação é persistente em todas as telas do grupo (app)

## Fluxo 8: Trial Expirado (Futuro - Fase Stripe)

1. Após 7 dias, usuário tenta acessar receitas
2. Vê tela de paywall
3. Escolhe plano (mensal ou anual)
4. Redirecionado para Stripe Checkout
5. Completa pagamento
6. Volta para app com assinatura ativa
7. Pode acessar todas as funcionalidades
