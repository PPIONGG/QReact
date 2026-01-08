import { httpClient } from './httpClient'
import type { SupplierListResponse, SupplierDetailResponse } from '../types'

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

/**
 * Get supplier detail by code
 * Calls /api/Supplier/GetSupplier API
 */
export async function getSupplier(
  moduleCode: string,
  documentTypeCode: string,
  supplierCode: string,
  accessToken: string,
  packageCode: string
): Promise<SupplierDetailResponse> {
  return httpClient.get<SupplierDetailResponse>(`/api/Supplier/GetSupplier`, {
    accessToken,
    packageCode,
    params: {
      moduleCode,
      documentTypeCode,
      supplierCode,
    },
  })
}

export const supplierService = {
  getSupplierList,
  getSupplier,
}
