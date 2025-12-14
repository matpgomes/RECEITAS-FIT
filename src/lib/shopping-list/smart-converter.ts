import {
  getAllIngredients,
  getIngredientPackages,
  getUnitConversion,
  type Ingredient,
  type IngredientPackage,
  type ShoppingListItem
} from '@/lib/supabase/queries/shopping-list'

interface RecipeIngredient {
  item: string
  quantity: string
  notes?: string
}

interface ConversionResult {
  ingredient_name: string
  category: string
  emoji?: string
  recipe_quantity: number
  recipe_unit: string
  buy_quantity: number
  buy_unit: string
  buy_package: string
}

/**
 * Extrair quantidade e unidade de uma string
 * Ex: "2 xícaras" → { amount: 2, unit: "xícara" }
 */
function parseQuantity(quantityStr: string): { amount: number; unit: string } {
  try {
    // Validar entrada
    if (!quantityStr || typeof quantityStr !== 'string') {
      console.warn('Invalid quantity string:', quantityStr)
      return { amount: 1, unit: 'unidade' }
    }

    // Remover espaços extras
    const cleaned = quantityStr.trim()

    // Se for apenas texto sem número (ex: "a gosto"), retorna padrão
    if (!cleaned || !/\d/.test(cleaned)) {
      return { amount: 1, unit: 'unidade' }
    }

    // Regex para capturar número (incluindo decimais e frações) e unidade
    const match = cleaned.match(/^([\d.,\/]+)\s*(.*)$/)

    if (!match) {
      return { amount: 1, unit: 'unidade' }
    }

    let amount = 1
    const amountStr = match[1].replace(',', '.')

    // Tratar frações (ex: "1/2")
    if (amountStr.includes('/')) {
      const parts = amountStr.split('/')
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0])
        const denominator = parseFloat(parts[1])

        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          amount = numerator / denominator
        }
      }
    } else {
      amount = parseFloat(amountStr)
    }

    // Validar resultado
    if (isNaN(amount) || amount <= 0) {
      console.warn(`Invalid amount parsed from "${quantityStr}":`, amount)
      return { amount: 1, unit: 'unidade' }
    }

    const unit = match[2]?.trim()?.toLowerCase() || 'unidade'

    // Normalizar unidades plurais
    const normalizedUnit = normalizeUnit(unit)

    return { amount, unit: normalizedUnit }
  } catch (error) {
    console.error('Error parsing quantity:', quantityStr, error)
    return { amount: 1, unit: 'unidade' }
  }
}

/**
 * Normalizar unidades (singular/plural)
 */
function normalizeUnit(unit: string): string {
  if (!unit) return 'unidade'

  const unitMap: Record<string, string> = {
    // Plurais
    'xícaras': 'xícara',
    'colheres de sopa': 'colher de sopa',
    'colheres de chá': 'colher de chá',
    'colher sopa': 'colher de sopa',
    'colher chá': 'colher de chá',
    'copos': 'copo',
    'litros': 'litro',
    'gramas': 'g',
    'mililitros': 'ml',
    'unidades': 'unidade',
    // Abreviações
    'un': 'unidade',
    'und': 'unidade',
    'u': 'unidade',
    'kg': 'kg',
    'gr': 'g',
    'grs': 'g',
    'lt': 'litro',
    'l': 'litro',
    'cs': 'colher de sopa',
    'cc': 'colher de chá',
    // Outros
    'pitada': 'pitada',
    'pitadas': 'pitada',
    'a gosto': 'unidade',
    'q.b.': 'unidade',
    'qb': 'unidade'
  }

  return unitMap[unit.toLowerCase()] || unit
}

/**
 * Encontrar ingrediente no banco por nome (match parcial)
 */
async function findIngredient(ingredientName: string): Promise<Ingredient | null> {
  const allIngredients = await getAllIngredients()

  const nameLower = ingredientName.toLowerCase()

  // Busca exata
  let found = allIngredients.find(ing => ing.name.toLowerCase() === nameLower)

  // Busca parcial (contém)
  if (!found) {
    found = allIngredients.find(ing =>
      nameLower.includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(nameLower)
    )
  }

  return found || null
}

/**
 * Converter quantidade da receita para unidade base do ingrediente
 */
async function convertToBaseUnit(
  amount: number,
  fromUnit: string,
  baseUnit: string,
  ingredientCategory?: string
): Promise<number> {

  // Se já está na unidade base, retorna direto
  if (fromUnit === baseUnit) {
    return amount
  }

  // Buscar conversão no banco
  const conversion = await getUnitConversion(fromUnit, baseUnit, ingredientCategory)

  if (conversion) {
    return amount * conversion.conversion_factor
  }

  // Conversões hardcoded comuns (fallback)
  const hardcodedConversions: Record<string, Record<string, number>> = {
    // Volume
    'xícara': { 'ml': 240, 'g': 200 },
    'colher de sopa': { 'ml': 15, 'g': 12 },
    'colher de chá': { 'ml': 5, 'g': 5 },
    'copo': { 'ml': 250, 'g': 250 },
    'litro': { 'ml': 1000 },
    'ml': { 'litro': 0.001 },
    // Peso
    'kg': { 'g': 1000 },
    'g': { 'kg': 0.001 },
    // Unidades especiais (usar valor base)
    'pitada': { 'g': 1, 'ml': 1 },
    'unidade': { 'g': 1, 'ml': 1 }
  }

  if (hardcodedConversions[fromUnit] && hardcodedConversions[fromUnit][baseUnit]) {
    return amount * hardcodedConversions[fromUnit][baseUnit]
  }

  // Se as unidades são iguais (ignoring case), retorna direto
  if (fromUnit.toLowerCase() === baseUnit.toLowerCase()) {
    return amount
  }

  // Se não encontrou conversão, retorna a quantidade original com warning
  console.warn(`No conversion found from "${fromUnit}" to "${baseUnit}". Using original amount.`)
  return amount
}

/**
 * Escolher a melhor embalagem para a quantidade necessária
 */
function chooseBestPackage(
  quantityInBaseUnit: number,
  packages: IngredientPackage[]
): { packagesToBuy: number; selectedPackage: IngredientPackage } {

  if (packages.length === 0) {
    throw new Error('No packages available')
  }

  // Ordenar por tamanho (menor para maior)
  const sortedPackages = [...packages].sort((a, b) => a.quantity - b.quantity)

  let bestPackage = sortedPackages[0]
  let minWaste = Infinity
  let bestCount = 1

  for (const pkg of sortedPackages) {
    // Quantas embalagens são necessárias?
    const packagesNeeded = Math.ceil(quantityInBaseUnit / pkg.quantity)

    // Quanto vai sobrar?
    const totalBought = packagesNeeded * pkg.quantity
    const waste = totalBought - quantityInBaseUnit
    const wastePercent = (waste / totalBought) * 100

    // Preferir embalagem que minimize desperdício (mas aceita até 50% de sobra)
    if (wastePercent <= 50 && waste < minWaste) {
      bestPackage = pkg
      minWaste = waste
      bestCount = packagesNeeded
    }
  }

  // Se não encontrou nenhuma boa, pega a menor embalagem
  if (minWaste === Infinity) {
    bestPackage = sortedPackages[0]
    bestCount = Math.ceil(quantityInBaseUnit / bestPackage.quantity)
  }

  return {
    packagesToBuy: bestCount,
    selectedPackage: bestPackage
  }
}

/**
 * Converter ingrediente da receita para item de compra
 */
export async function convertIngredientToShoppingItem(
  recipeIngredient: RecipeIngredient
): Promise<ConversionResult> {

  try {
    // Validar dados de entrada
    if (!recipeIngredient || !recipeIngredient.item) {
      console.warn('Invalid ingredient data:', recipeIngredient)
      return {
        ingredient_name: 'Ingrediente desconhecido',
        category: 'outros',
        recipe_quantity: 1,
        recipe_unit: 'unidade',
        buy_quantity: 1,
        buy_unit: 'unidade',
        buy_package: '1 unidade'
      }
    }

    const { amount: recipeQty, unit: recipeUnit } = parseQuantity(recipeIngredient.quantity || '1 unidade')

    // Validar quantidade
    if (!recipeQty || isNaN(recipeQty) || recipeQty <= 0) {
      console.warn(`Invalid quantity for ${recipeIngredient.item}:`, recipeIngredient.quantity)
      return {
        ingredient_name: recipeIngredient.item,
        category: 'outros',
        recipe_quantity: 1,
        recipe_unit: recipeUnit || 'unidade',
        buy_quantity: 1,
        buy_unit: recipeUnit || 'unidade',
        buy_package: `1 ${recipeUnit || 'unidade'}`
      }
    }

    // Buscar ingrediente no banco
    const ingredient = await findIngredient(recipeIngredient.item)

    // Se não encontrou no banco, retorna como está
    if (!ingredient) {
      return {
        ingredient_name: recipeIngredient.item,
        category: 'outros',
        recipe_quantity: recipeQty,
        recipe_unit: recipeUnit,
        buy_quantity: recipeQty,
        buy_unit: recipeUnit,
        buy_package: `${recipeQty} ${recipeUnit}`
      }
    }

    // Buscar embalagens disponíveis
    const packages = await getIngredientPackages(ingredient.id)

    if (packages.length === 0) {
      // Sem embalagens cadastradas, retorna na unidade base
      const qtyInBase = await convertToBaseUnit(recipeQty, recipeUnit, ingredient.base_unit)

      return {
        ingredient_name: ingredient.name,
        category: ingredient.category,
        emoji: ingredient.emoji,
        recipe_quantity: recipeQty,
        recipe_unit: recipeUnit,
        buy_quantity: Math.ceil(qtyInBase),
        buy_unit: ingredient.base_unit,
        buy_package: `${Math.ceil(qtyInBase)} ${ingredient.base_unit}`
      }
    }

    // Converter para unidade base
    const quantityInBaseUnit = await convertToBaseUnit(
      recipeQty,
      recipeUnit,
      ingredient.base_unit,
      ingredient.category
    )

    // Validar resultado da conversão
    if (!quantityInBaseUnit || isNaN(quantityInBaseUnit) || quantityInBaseUnit <= 0) {
      console.warn(`Invalid conversion result for ${ingredient.name}`)
      return {
        ingredient_name: ingredient.name,
        category: ingredient.category,
        emoji: ingredient.emoji,
        recipe_quantity: recipeQty,
        recipe_unit: recipeUnit,
        buy_quantity: recipeQty,
        buy_unit: recipeUnit,
        buy_package: `${recipeQty} ${recipeUnit}`
      }
    }

    // Escolher melhor embalagem
    const { packagesToBuy, selectedPackage } = chooseBestPackage(quantityInBaseUnit, packages)

    return {
      ingredient_name: ingredient.name,
      category: ingredient.category,
      emoji: ingredient.emoji,
      recipe_quantity: recipeQty,
      recipe_unit: recipeUnit,
      buy_quantity: packagesToBuy,
      buy_unit: selectedPackage.unit,
      buy_package: `${packagesToBuy} ${selectedPackage.package_name}${packagesToBuy > 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error(`Error converting ingredient "${recipeIngredient?.item}":`, error)

    // Retornar fallback seguro
    return {
      ingredient_name: recipeIngredient?.item || 'Ingrediente',
      category: 'outros',
      recipe_quantity: 1,
      recipe_unit: 'unidade',
      buy_quantity: 1,
      buy_unit: 'unidade',
      buy_package: '1 unidade'
    }
  }
}

/**
 * Converter lista de ingredientes da receita para lista de compras
 */
export async function convertRecipeToShoppingList(
  recipeIngredients: RecipeIngredient[]
): Promise<ConversionResult[]> {

  const results: ConversionResult[] = []

  for (const ingredient of recipeIngredients) {
    try {
      const converted = await convertIngredientToShoppingItem(ingredient)
      results.push(converted)
    } catch (error) {
      console.error(`Error converting ingredient ${ingredient.item}:`, error)
      // Adiciona como está em caso de erro
      const { amount, unit } = parseQuantity(ingredient.quantity)
      results.push({
        ingredient_name: ingredient.item,
        category: 'outros',
        recipe_quantity: amount,
        recipe_unit: unit,
        buy_quantity: amount,
        buy_unit: unit,
        buy_package: `${amount} ${unit}`
      })
    }
  }

  return results
}
