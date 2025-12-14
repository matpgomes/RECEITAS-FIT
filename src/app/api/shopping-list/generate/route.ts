import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const N8N_WEBHOOK_URL = 'https://ia-n8n.gfkhje.easypanel.host/webhook/7938586c-25d2-409b-ba1c-dcd1cceb7fa6'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Pegar dados do request
    const body = await request.json()
    const { recipe_ids, list_name, ingredients } = body

    let payload: any

    // Fluxo 1: Lista gerada a partir de RECEITAS (recipe_ids fornecido)
    if (recipe_ids && Array.isArray(recipe_ids) && recipe_ids.length > 0) {
      // Buscar receitas completas do banco
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipe_ids)

      if (recipesError) {
        console.error('Error fetching recipes:', recipesError)
        return NextResponse.json(
          { error: 'Erro ao buscar receitas' },
          { status: 500 }
        )
      }

      // Formatar payload para o N8N (fluxo antigo com receitas)
      payload = {
        user_id: user.id,
        list_name: list_name || `Lista de Compras - ${new Date().toLocaleDateString('pt-BR')}`,
        recipes: recipes.map(recipe => ({
          recipe_id: recipe.id,
          recipe_name: recipe.title,
          servings: recipe.serves_people,
          ingredients: recipe.ingredients || []
        }))
      }
    }
    // Fluxo 2: Lista gerada a partir da DRAFT (ingredients fornecidos diretamente)
    else if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      // Criar lista no banco antes de processar
      const { data: newList, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: list_name || `Lista de Compras - ${new Date().toLocaleDateString('pt-BR')}`,
          status: 'active',
          servings: 1
        })
        .select()
        .single()

      if (listError) {
        console.error('Error creating shopping list:', listError)
        return NextResponse.json(
          { error: 'Erro ao criar lista' },
          { status: 500 }
        )
      }

      // Formatar payload para o N8N (fluxo novo com ingredientes diretos)
      payload = {
        user_id: user.id,
        list_id: newList.id,
        list_name: list_name || `Lista de Compras - ${new Date().toLocaleDateString('pt-BR')}`,
        ingredients: ingredients
      }

      // Enviar para o N8N
      const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error('N8N webhook error:', errorText)
        return NextResponse.json(
          { error: 'Erro ao processar com N8N', details: errorText },
          { status: 500 }
        )
      }

      // Retornar sucesso com o list_id criado
      return NextResponse.json({
        success: true,
        list_id: newList.id,
        message: 'Lista criada e enviada para processamento IA!'
      })
    }
    // Nenhum dos dois fornecidos
    else {
      return NextResponse.json(
        { error: 'É necessário fornecer recipe_ids ou ingredients' },
        { status: 400 }
      )
    }

    // Enviar para o N8N (fluxo antigo com receitas)
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('N8N webhook error:', errorText)
      return NextResponse.json(
        { error: 'Erro ao processar com N8N', details: errorText },
        { status: 500 }
      )
    }

    const webhookResult = await webhookResponse.json()

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      list_id: webhookResult.list_id,
      message: webhookResult.message || 'Lista gerada com sucesso pela IA!'
    })

  } catch (error) {
    console.error('Error generating shopping list:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar lista de compras' },
      { status: 500 }
    )
  }
}
