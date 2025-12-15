import { httpClient } from './httpClient'
import type { CalculateVatRequest, CalculateVatResponse } from '../types'

/**
 * Calculate VAT Amount
 * Calls POST /api/Calculate/CalculateVatAmount API
 */
export async function calculateVatAmount(
  request: CalculateVatRequest,
  accessToken: string,
  packageCode: string
): Promise<CalculateVatResponse> {
  return httpClient.post<CalculateVatResponse>(
    `/api/Calculate/CalculateVatAmount`,
    request,
    {
      accessToken,
      packageCode,
    }
  )
}

export const calculateService = {
  calculateVatAmount,
}
