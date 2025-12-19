import { httpClient } from './httpClient'
import type { ItemListResponse, UnitConversionListResponse } from '../types'

/**
 * Get item list with pagination
 * Calls /api/Item/ItemList API
 */
export async function getItemList(
  accessToken: string,
  packageCode: string,
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<ItemListResponse> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
  return httpClient.get<ItemListResponse>(
    `/api/Item/ItemList?page=${page}&pageSize=${pageSize}${searchParam}`,
    {
      accessToken,
      packageCode,
    }
  )
}

/**
 * Get unit conversion list by default unit code
 * Calls /api/ItemUnit/UnitConversionList API
 */
export async function getUnitConversionList(
  defaultUnitCode: string,
  accessToken: string,
  packageCode: string
): Promise<UnitConversionListResponse> {
  return httpClient.get<UnitConversionListResponse>(
    `/api/ItemUnit/UnitConversionList?DefaultUnitcode=${encodeURIComponent(defaultUnitCode)}`,
    {
      accessToken,
      packageCode,
    }
  )
}

export const itemService = {
  getItemList,
  getUnitConversionList,
}
