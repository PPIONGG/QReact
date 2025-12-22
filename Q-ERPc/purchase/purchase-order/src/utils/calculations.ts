/**
 * Calculation utilities for PO line items and totals
 */

/**
 * Calculate discount amount from discount string
 * @param unitPrice - Price per unit
 * @param discount - Discount string (e.g., "10%", "100", "5.5%")
 * @returns Discount amount per unit
 */
export const calculateDiscountPerUnit = (
  unitPrice: number,
  discount: string
): number => {
  if (!discount) return 0

  const trimmed = discount.trim()
  if (trimmed.includes('%')) {
    const percent = parseFloat(trimmed.replace('%', ''))
    if (isNaN(percent)) return 0
    return (unitPrice * percent) / 100
  }

  const amount = parseFloat(trimmed)
  return isNaN(amount) ? 0 : amount
}

/**
 * Calculate line item total amount
 * @param quantity - Quantity
 * @param unitPrice - Price per unit
 * @returns Total amount (quantity * unitPrice)
 */
export const calculateLineAmount = (
  quantity: number,
  unitPrice: number
): number => {
  return quantity * unitPrice
}

/**
 * Calculate line item amount after discount
 * @param quantity - Quantity
 * @param unitPrice - Price per unit
 * @param discount - Discount string
 * @returns Amount after discount
 */
export const calculateLineAmountAfterDiscount = (
  quantity: number,
  unitPrice: number,
  discount: string
): number => {
  const discountPerUnit = calculateDiscountPerUnit(unitPrice, discount)
  return (unitPrice - discountPerUnit) * quantity
}

/**
 * Calculate VAT amount
 * @param amount - Amount before VAT
 * @param vatRate - VAT rate (e.g., 7 for 7%)
 * @returns VAT amount
 */
export const calculateVAT = (amount: number, vatRate: number): number => {
  return (amount * vatRate) / 100
}

/**
 * Calculate amount after VAT
 * @param amount - Amount before VAT
 * @param vatRate - VAT rate (e.g., 7 for 7%)
 * @returns Amount including VAT
 */
export const calculateAmountWithVAT = (
  amount: number,
  vatRate: number
): number => {
  return amount + calculateVAT(amount, vatRate)
}

/**
 * Parse discount string to get percentage or amount
 * @param discount - Discount string
 * @returns Object with type and value
 */
export const parseDiscount = (
  discount: string
): { type: 'percent' | 'amount'; value: number } => {
  if (!discount) return { type: 'amount', value: 0 }

  const trimmed = discount.trim()
  if (trimmed.includes('%')) {
    const value = parseFloat(trimmed.replace('%', ''))
    return { type: 'percent', value: isNaN(value) ? 0 : value }
  }

  const value = parseFloat(trimmed)
  return { type: 'amount', value: isNaN(value) ? 0 : value }
}
