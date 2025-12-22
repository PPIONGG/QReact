import { httpClient } from './httpClient'
import type { ApprovedConfigResponse } from '../types'

/**
 * Get Approved Config for PO
 * Calls GET /api/Approved/Config/PO API
 *
 * @param accessToken - Bearer token
 * @param packageCode - X-PACKAGE header value
 */
export async function getApprovedConfigPO(
  accessToken: string,
  packageCode: string
): Promise<ApprovedConfigResponse> {
  return httpClient.get<ApprovedConfigResponse>(`/api/Approved/Config/PO`, {
    accessToken,
    packageCode,
  })
}

export const approvedConfigService = {
  getApprovedConfigPO,
}
