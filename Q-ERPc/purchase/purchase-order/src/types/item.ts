import type { ApiResponse } from './permission'

export interface ItemListItem {
  documentModuleCode: string
  documentTypeCode: string
  code: string
  type: string
  t: string
  e: string
  purchaseNameT: string
  purchaseNameE: string
  defaultUnitCode: string
  purchaseUnitCode: string
  salesUnitCode: string
  manufacUnitCode: string
  suggestedPrice: number | null
  itemCodeSupplier: string | null
  excludeVATTrueFalse: boolean | null
  modelCode1: string | null
  refrigeratedCabinetCode: string | null
  itemImage: string | null
  itemImageName: string | null
  itemImagePath: string | null
}

export type ItemListResponse = ApiResponse<ItemListItem[]>

export interface UnitConversion {
  code: string
  t: string
  e: string
  unitType: string
  recStatus: number
}

export type UnitConversionListResponse = ApiResponse<UnitConversion[]>
