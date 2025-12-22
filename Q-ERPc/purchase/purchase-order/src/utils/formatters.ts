/**
 * Number formatting utilities for displaying currency and numeric values
 */

/**
 * Format number with commas and fixed decimal places
 * Compatible with antd InputNumber formatter signature
 */
export const formatNumber = (value: number | string | undefined): string => {
  if (!value && value !== 0) return ''
  const num = typeof value === 'number' ? value : parseFloat(value.toString())
  if (isNaN(num)) return ''
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format number with custom precision (for non-InputNumber use)
 */
export const formatNumberWithPrecision = (
  value: number | string | undefined,
  precision: number = 2
): string => {
  if (!value && value !== 0) return ''
  const num = typeof value === 'number' ? value : parseFloat(value.toString())
  if (isNaN(num)) return ''
  return num.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
}

/**
 * Format number with negative sign prefix (for discounts)
 * Compatible with antd InputNumber formatter signature
 */
export const formatNegativeNumber = (value: number | string | undefined): string => {
  if (!value && value !== 0) return ''
  const num = typeof value === 'number' ? value : parseFloat(value.toString())
  if (isNaN(num)) return ''
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return num > 0 ? `-${formatted}` : formatted
}

/**
 * Parse formatted number string back to number (removes commas)
 */
export const parseNumber = (value: string | undefined): number => {
  if (!value) return 0
  const cleaned = value.replace(/,/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Parse negative formatted number string (removes commas and minus sign)
 */
export const parseNegativeNumber = (value: string | undefined): number => {
  if (!value) return 0
  const cleaned = value.replace(/,/g, '').replace(/-/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Format number with commas and fixed decimal places (for InputNumber parser)
 * Returns as unknown as number for antd InputNumber compatibility
 */
export const parseNumberForInput = (value: string | undefined) =>
  value?.replace(/,/g, '') as unknown as number

export const parseNegativeNumberForInput = (value: string | undefined) =>
  value?.replace(/,/g, '').replace(/-/g, '') as unknown as number

/**
 * Format date string to DD/MM/YYYY format
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date string to DD/MM/YYYY HH:mm format
 */
export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
