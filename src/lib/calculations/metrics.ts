/**
 * Funções de cálculo de métricas de saúde
 * Baseado em fórmulas científicas reconhecidas
 */

export interface MetricsInput {
  age: number
  biological_sex: 'female' | 'male'
  height_cm: number
  weight_kg: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active'
  waist_cm?: number
  hip_cm?: number
}

export interface CalculatedMetrics {
  bmi: number
  bmi_classification: string
  bmr: number // Taxa Metabólica Basal
  metabolic_age: number
  body_fat_percentage: number | null
  recommended_daily_calories: number
}

/**
 * Calcula o IMC (Índice de Massa Corporal)
 * Fórmula: peso (kg) / (altura (m))²
 */
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const height_m = height_cm / 100
  return Number((weight_kg / (height_m * height_m)).toFixed(1))
}

/**
 * Classifica o IMC segundo padrões da OMS
 */
export function classifyBMI(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso'
  if (bmi < 25) return 'Peso normal'
  if (bmi < 30) return 'Sobrepeso'
  if (bmi < 35) return 'Obesidade grau I'
  if (bmi < 40) return 'Obesidade grau II'
  return 'Obesidade grau III'
}

/**
 * Calcula a TMB (Taxa Metabólica Basal) usando a fórmula Mifflin-St Jeor
 * A mais precisa para populações modernas
 *
 * Homens: TMB = (10 × peso em kg) + (6,25 × altura em cm) - (5 × idade em anos) + 5
 * Mulheres: TMB = (10 × peso em kg) + (6,25 × altura em cm) - (5 × idade em anos) - 161
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  biological_sex: 'female' | 'male'
): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  const bmr = biological_sex === 'male' ? base + 5 : base - 161
  return Math.round(bmr)
}

/**
 * Calcula o TDEE (Total Daily Energy Expenditure)
 * TMB multiplicado pelo fator de atividade
 */
export function calculateTDEE(
  bmr: number,
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active'
): number {
  const activityMultipliers = {
    sedentary: 1.2, // Pouco ou nenhum exercício
    light: 1.375, // Exercício leve 1-3 dias/semana
    moderate: 1.55, // Exercício moderado 3-5 dias/semana
    very_active: 1.725, // Exercício intenso 6-7 dias/semana
  }

  return Math.round(bmr * activityMultipliers[activity_level])
}

/**
 * Calcula o percentual de gordura corporal usando o método da Marinha dos EUA
 * Requer medidas de cintura e quadril
 *
 * Homens: % = 86.010 × log10(abdômen - pescoço) - 70.041 × log10(altura) + 36.76
 * Mulheres: % = 163.205 × log10(cintura + quadril - pescoço) - 97.684 × log10(altura) - 78.387
 *
 * Simplificado (sem medida de pescoço):
 * Homens: Baseado em cintura e altura
 * Mulheres: Baseado em cintura, quadril e altura
 */
export function calculateBodyFatPercentage(
  biological_sex: 'female' | 'male',
  height_cm: number,
  waist_cm?: number,
  hip_cm?: number
): number | null {
  if (!waist_cm) return null

  if (biological_sex === 'male') {
    // Fórmula simplificada para homens
    const bodyFat = (waist_cm * 0.74 - height_cm * 0.082 - 44.74) / height_cm * 100
    return Number(Math.max(5, Math.min(50, bodyFat)).toFixed(1))
  } else {
    // Para mulheres, precisamos da medida do quadril
    if (!hip_cm) return null

    // Fórmula simplificada para mulheres
    const bodyFat = ((waist_cm + hip_cm - height_cm) * 0.157 - 2.9 - height_cm * 0.016) / height_cm * 100
    return Number(Math.max(10, Math.min(60, bodyFat)).toFixed(1))
  }
}

/**
 * Estima a idade metabólica baseada na TMB e idade real
 * Quanto maior a TMB em relação à idade, menor a idade metabólica
 *
 * Esta é uma estimativa simplificada. Idealmente seria baseado em:
 * - Composição corporal
 * - Massa muscular
 * - Percentual de gordura
 */
export function calculateMetabolicAge(
  bmr: number,
  age: number,
  weight_kg: number,
  biological_sex: 'female' | 'male'
): number {
  // TMB média esperada para a idade e sexo
  const expectedBMR = biological_sex === 'male'
    ? 88.362 + (13.397 * weight_kg) - (5.677 * age)
    : 447.593 + (9.247 * weight_kg) - (4.330 * age)

  // Diferença percentual
  const bmrDifference = ((bmr - expectedBMR) / expectedBMR) * 100

  // Cada 5% de TMB acima da média = -1 ano metabólico
  // Cada 5% de TMB abaixo da média = +1 ano metabólico
  const ageAdjustment = Math.round(bmrDifference / -5)

  const metabolicAge = age + ageAdjustment

  // Limitar entre 18 e 80 anos
  return Math.max(18, Math.min(80, metabolicAge))
}

/**
 * Calcula calorias diárias recomendadas baseadas no objetivo
 *
 * - Perda de peso rápida: TDEE - 500 cal (deficit de ~0.5kg/semana)
 * - Perda de peso saudável: TDEE - 300 cal (deficit de ~0.3kg/semana)
 * - Manter energia: TDEE
 * - Melhorar saúde: TDEE - 200 cal
 */
export function calculateRecommendedCalories(
  tdee: number,
  main_goal: 'fast_weight_loss' | 'healthy_weight_loss' | 'maintain_energy' | 'improve_health'
): number {
  const calorieDeficits = {
    fast_weight_loss: -500,
    healthy_weight_loss: -300,
    maintain_energy: 0,
    improve_health: -200,
  }

  const recommendedCalories = tdee + calorieDeficits[main_goal]

  // Não permitir menos que 1200 cal/dia (mulheres) ou 1500 cal/dia (homens)
  // Por segurança, vamos usar 1200 como mínimo absoluto
  return Math.max(1200, Math.round(recommendedCalories))
}

/**
 * Função principal que calcula todas as métricas de uma vez
 */
export function calculateAllMetrics(input: MetricsInput, main_goal: string): CalculatedMetrics {
  const bmi = calculateBMI(input.weight_kg, input.height_cm)
  const bmi_classification = classifyBMI(bmi)

  const bmr = calculateBMR(
    input.weight_kg,
    input.height_cm,
    input.age,
    input.biological_sex
  )

  const tdee = calculateTDEE(bmr, input.activity_level)

  const metabolic_age = calculateMetabolicAge(
    bmr,
    input.age,
    input.weight_kg,
    input.biological_sex
  )

  const body_fat_percentage = calculateBodyFatPercentage(
    input.biological_sex,
    input.height_cm,
    input.waist_cm,
    input.hip_cm
  )

  const recommended_daily_calories = calculateRecommendedCalories(
    tdee,
    main_goal as any
  )

  return {
    bmi,
    bmi_classification,
    bmr,
    metabolic_age,
    body_fat_percentage,
    recommended_daily_calories,
  }
}

/**
 * Formata as métricas para exibição user-friendly
 */
export function formatMetrics(metrics: CalculatedMetrics) {
  return {
    bmi: {
      value: metrics.bmi,
      label: 'IMC',
      classification: metrics.bmi_classification,
      description: 'Índice de Massa Corporal',
    },
    bmr: {
      value: metrics.bmr,
      label: 'TMB',
      unit: 'kcal/dia',
      description: 'Taxa Metabólica Basal (calorias em repouso)',
    },
    metabolic_age: {
      value: metrics.metabolic_age,
      label: 'Idade Metabólica',
      unit: 'anos',
      description: 'Sua idade baseada no metabolismo',
    },
    body_fat_percentage: {
      value: metrics.body_fat_percentage,
      label: 'Gordura Corporal',
      unit: '%',
      description: 'Percentual estimado de gordura',
    },
    recommended_daily_calories: {
      value: metrics.recommended_daily_calories,
      label: 'Calorias Recomendadas',
      unit: 'kcal/dia',
      description: 'Para atingir seu objetivo',
    },
  }
}
