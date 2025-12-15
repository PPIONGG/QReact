import type { ApiResponse } from '@qerp/shared'

export interface CalculateHeader {
  noDigitQty: number
  noDigitUnitPrice: number
  noDigitTotal: number
  adjustVATYesNo: string
  adjustTotalYesNo: boolean
  exchangeRate: number
  vatRate: number
  includeVATTrueFalse: boolean
  totalAmountCurrency: number
  totalAmountBeforeVATLocalCurrency: number
  discountStringBeforeVAT: string
  amountDiscountCurrency: number
  amountDiscountBaht: number
  totalAmountCurrencyAfterDiscountBeforeVAT: number
  totalAmountBahtAfterDiscountBeforeVAT: number
  vatAmountCurrency: number
  vatAmountLocalCurrency: number
  vatBasedForVATAmountCurrency: number
  vatBasedForVATAmountBaht: number
  totalAmountCurrencyAfterVAT: number
  totalAmountAfterVATLocalCurrency: number
}

export interface CalculateDetail {
  useExpenseSameLocalCurrencyTrueFalse: boolean
  excludeVATTrueFalse: boolean
  flagExcludeExpenseExport: boolean
  vLine: number
  transactionType: string
  transactionCode: string
  quantity: number
  unitPriceCurrency: number
  discount: string
  totalAmountCurrency: number
  unitPriceAfterDiscount: number
  unitPriceLocalCurrencyAfterDiscount: number
  totalAmountCurrencyAfterDiscount: number
  totalAmountAfterDiscountLocalCurrency: number
  vatBasedAmountCurrency: number
  transactionTotalAmountBaht: number
  transactionTotalAmountBahtAfterDiscountBeforeVAT: number
  transactionVATAmountBaht: number
  transactionTotalAmountAfterVATBaht: number
}

export interface CalculateVatRequest {
  calculateHeader: CalculateHeader
  calculateDetails: CalculateDetail[]
}

export interface CalculateVatResult {
  calculateHeader: CalculateHeader
  calculateDetails: CalculateDetail[]
}

export type CalculateVatResponse = ApiResponse<CalculateVatResult>
