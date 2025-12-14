import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Await params para Next.js 16
    const resolvedParams = await params
    const listId = resolvedParams.id

    // Buscar lista com itens
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        items:shopping_list_items(*)
      `)
      .eq('id', listId)
      .eq('user_id', user.id)
      .single()

    if (listError) {
      console.error('Error fetching list:', listError)
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Error in GET /api/shopping-list/[id]:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lista' },
      { status: 500 }
    )
  }
}
