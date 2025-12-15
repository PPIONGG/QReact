import type { ApiResponse } from '@qerp/shared'

export interface Warehouse {
  code: string
  nameT: string
  nameE: string
  addressThai: string
  addressEng: string
}

export type WarehouseListResponse = ApiResponse<Warehouse[]>
