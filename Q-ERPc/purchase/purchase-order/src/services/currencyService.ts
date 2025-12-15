import { httpClient } from './httpClient'
import type { CurrencyListResponse } from '../types'

/**
 * Get currency list
 * Calls /api/Currency/GetCurrency API
 */
export async function getCurrencyList(
  accessToken: string,
  packageCode: string
): Promise<CurrencyListResponse> {
  return httpClient.get<CurrencyListResponse>(`/api/Currency/GetCurrency`, {
    accessToken,
    packageCode,
  })
}

export const currencyService = {
  getCurrencyList,
}
