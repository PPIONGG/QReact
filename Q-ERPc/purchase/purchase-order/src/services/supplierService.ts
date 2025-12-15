import { httpClient } from './httpClient'
import type { SupplierListResponse } from '../types'

/**
 * Get supplier list
 * Calls /api/Supplier/SupplierList API
 */
export async function getSupplierList(
  accessToken: string,
  packageCode: string
): Promise<SupplierListResponse> {
  return httpClient.get<SupplierListResponse>(`/api/Supplier/SupplierList`, {
    accessToken,
    packageCode,
  })
}

export const supplierService = {
  getSupplierList,
}
