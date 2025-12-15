import { httpClient } from './httpClient'
import type { CompanyInfoResponse } from '../types'

/**
 * Get company info including noDigit settings
 * Calls /api/Company/ComapyInfo API
 */
export async function getCompanyInfo(
  accessToken: string,
  packageCode: string
): Promise<CompanyInfoResponse> {
  return httpClient.get<CompanyInfoResponse>(`/api/Company/ComapyInfo`, {
    accessToken,
    packageCode,
  })
}

export const companyService = {
  getCompanyInfo,
}
