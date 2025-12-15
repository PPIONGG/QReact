import type { ApiResponse } from './permission'

export interface Warehouse {
  code: string
  nameT: string
  nameE: string
  addressThai: string
  addressEng: string
}

export type WarehouseListResponse = ApiResponse<Warehouse[]>
