import { httpClient } from './httpClient'
import type { ActionPermissionResponse } from '../types'

/**
 * Get action permission for a module
 * Calls QERPcMenuActionJWT/{moduleCode} API
 *
 * @param moduleCode - Module code (e.g., 'PO' for Purchase Order)
 * @param accessToken - Bearer token from QERPcMenuJWT
 * @param companyCode - Company code for header
 */
export async function getActionPermission(
  moduleCode: string,
  accessToken: string,
  companyCode: string
): Promise<ActionPermissionResponse> {
  return httpClient.get<ActionPermissionResponse>(
    `/api/JWT/QERPcMenuActionJWT/${moduleCode}`,
    {
      accessToken,
      packageCode: companyCode,
    }
  )
}

export const permissionService = {
  getActionPermission,
}
