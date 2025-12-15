import { httpClient } from './httpClient'
import type { WarehouseListResponse } from '../types'

/**
 * Get warehouse list
 * Calls /api/Warehouse/GetListWarehouse API
 */
export async function getWarehouseList(
  accessToken: string,
  packageCode: string
): Promise<WarehouseListResponse> {
  return httpClient.get<WarehouseListResponse>(`/api/Warehouse/GetListWarehouse`, {
    accessToken,
    packageCode,
  })
}

export const warehouseService = {
  getWarehouseList,
}
