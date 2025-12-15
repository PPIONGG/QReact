import type { ApiResponse } from '@qerp/shared'

export interface CompanyInfo {
  code: string
  t: string
  e: string
  vatrate: number
  noDigitQty: number
  noDigitQtyBom: number
  noDigitUnitPrice: number
  noDigitTotal: number
  addressThai: string
  addressEng: string
  taxId: string
  phone1: string | null
  phone2: string | null
  fax1: string | null
  email: string | null
  localCurrencyCode: string
}

export type CompanyInfoResponse = ApiResponse<CompanyInfo>
