import { createClient } from '@/lib/supabase/server'
import { completeOnboardingSchema } from '@/lib/validations/onboarding'
import { calculateAllMetrics } from '@/lib/calculations/metrics'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parsear e validar dados
    const body = await request.json()
    const validatedData = completeOnboardingSchema.parse(body)

    // Calcular métricas de saúde
    const metrics = calculateAllMetrics(
      {
        age: validatedData.age,
        biological_sex: validatedData.biological_sex,
        height_cm: validatedData.height_cm,
        weight_kg: validatedData.current_weight_kg,
        activity_level: validatedData.activity_level,
        waist_cm: validatedData.waist_cm || undefined,
        hip_cm: validatedData.hip_cm || undefined,
      },
      validatedData.main_goal || 'healthy_weight_loss'
    )

    // Inserir perfil do usuário com métricas calculadas
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        age: validatedData.age,
        height_cm: validatedData.height_cm,
        current_weight_kg: validatedData.current_weight_kg,
        goal_weight_kg: validatedData.goal_weight_kg,
        biological_sex: validatedData.biological_sex,
        activity_level: validatedData.activity_level,
        health_conditions: validatedData.health_conditions || [],
        health_conditions_other: validatedData.health_conditions_other || null,
        main_goal: validatedData.main_goal || null,
        home_meals_per_week: validatedData.home_meals_per_week || null,
        waist_cm: validatedData.waist_cm || null,
        hip_cm: validatedData.hip_cm || null,
        weight_change_pattern: validatedData.weight_change_pattern || null,
        tried_restrictive_diets: validatedData.tried_restrictive_diets ?? null,
        time_trying_to_lose_weight: validatedData.time_trying_to_lose_weight || null,
        food_allergies: validatedData.food_allergies || [],
        food_allergies_other: validatedData.food_allergies_other || null,
        // Métricas calculadas
        bmi: metrics.bmi,
        bmr: metrics.bmr,
        metabolic_age: metrics.metabolic_age,
        initial_metabolic_age: metrics.metabolic_age, // Guardar valor inicial para comparação
        body_fat_percentage: metrics.body_fat_percentage,
        recommended_daily_calories: metrics.recommended_daily_calories,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Erro ao criar perfil: ' + profileError.message },
        { status: 500 }
      )
    }

    // Atualizar status do usuário como profile_completed = true
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_completed: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('User update error:', updateError)
      // Não retornar erro aqui, pois o perfil já foi criado
    }

    // Criar log inicial de peso
    await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight_kg: validatedData.current_weight_kg,
      logged_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      profile,
      metrics: {
        bmi: metrics.bmi,
        bmi_classification: metrics.bmi_classification,
        bmr: metrics.bmr,
        metabolic_age: metrics.metabolic_age,
        body_fat_percentage: metrics.body_fat_percentage,
        recommended_daily_calories: metrics.recommended_daily_calories,
        weight_to_lose: validatedData.current_weight_kg - validatedData.goal_weight_kg,
      },
    })
  } catch (error: any) {
    console.error('Complete onboarding error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao completar onboarding' },
      { status: 500 }
    )
  }
}
