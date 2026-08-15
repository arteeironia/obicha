// Categoria do produto (o que o admin escolhe) -> nome do tipo de variante correspondente
// Usado pra saber qual variante representa "o preço principal" do produto de forma correta
export const CATEGORY_TO_VARIANT_TYPE: Record<string, string> = {
  camisetas: 'Camiseta',
  estonada: 'Estonada',
  dryfit: 'Dry Fit',
  modal: 'Modal Tech',
  peruano: 'Camiseta Algodão Peruano',
  oversized: 'Camiseta Oversized',
  regata: 'Regata',
  cropped: 'Cropped',
  'cropped-moletom': 'Cropped Moletom',
  infantil: 'Camiseta Infantil',
  hoodie: 'Hoodie Moletom',
  sueter: 'Suéter Moletom',
  bones: 'Boné',
  canecas: 'Caneca',
  ecobags: 'Ecobag',
  bottoms: 'Kit de Bottons',
}

function priceToNumber(price: string): number {
  const match = (price || '').replace(/\./g, '').match(/(\d+),?(\d{0,2})/)
  if (!match) return Infinity
  return parseFloat(`${match[1]}.${match[2] ? match[2].padEnd(2, '0') : '00'}`)
}

/**
 * Escolhe qual variante representa o preço/link "principal" de um produto:
 * 1. Se a Categoria do produto bate com o tipo de alguma variante, usa essa (o que o admin escolheu como principal)
 * 2. Senão, usa a variante de menor preço (mais seguro do que pegar uma aleatória)
 */
export function pickRepresentativeVariant(
  category: string,
  variants: { type: string; price: string; link: string }[]
): { type: string; price: string; link: string } | null {
  if (!variants || variants.length === 0) return null

  const expectedType = CATEGORY_TO_VARIANT_TYPE[category]
  if (expectedType) {
    const matched = variants.find((v) => v.type === expectedType)
    if (matched) return matched
  }

  // fallback: menor preço entre as variantes disponíveis
  return [...variants].sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price))[0]
}
