// import type { ApiResponse } from './permission'

import type { ApiResponse } from "@qerp/shared"

// import type { ApiResponse } from "../../../../../shared/src/types/api"

export interface POHeader {
  documentModuleCode: string
  documentTypeCode: string
  runNo: number
  yyear: number
  yyearRunNo: number
  pono: string
  podate: string
  supplierCode: string
  supplierName: string
  approvedStatus01: string
  deliveryStatus: string
  recStatus: number
  lastUpdated: string
  updatedUser: string
}

export interface POHeaderListResponse {
  code: number
  msg: string | null
  result: POHeader[] | null
}

// POInsert types
export interface PODetail {
  noLine: number
  vline: number
  transactionCode: string
  transactionDescription: string
  transactionCodeSupplier: string
  quantity: number
  defaultUnitCode: string
  purchaseUnitCode: string
  unitPriceCurrency: number
  discount: string
  totalAmountCurrency: number
  totalAmountAfterDiscount: number
  statusRow: string
  excludeVATTrueFalse: boolean
}

export interface POOrder {
  documentModuleCode: string
  documentTypeCode: string
  runNo: number
  pono: string
  podate: string
  refNoYours: string
  refNoOurs: string
  supplierCode: string
  supplierPrefix: string
  supplierName: string
  supplierSuffix: string
  targetShippingDate: string | null
  paymentTermCode: string
  paymentDueDate: string | null
  currencyCode: string
  exchangeRate: number
  totalAmountCurrency: number
  vatrate: number
  vatamountCurrency: number
  totalAmountCurrencyAfterVat: number
  amountDiscountCurrency: number
  totalAmountCurrencyAfterDiscountBeforeVat: number
  discountStringBeforeVat: string
  note: string
  totalAmountIncludeVattrueFalse: boolean
  costCenterCode: string
  costCenterName: string
  billingCode: string
  contactName: string
  paymentTermRefDoc: string
  memo: string
  sellerRefNo: string
  adjustVATYesNo: string
  poDetails: PODetail[]
}

export interface POInsertRequest {
  userName: string
  poOrder: POOrder
}

export type POInsertResponse = ApiResponse<unknown>

// POUpdate response
export type POUpdateResponse = ApiResponse<unknown>

// POOrder response for edit mode
export type POOrderResponse = ApiResponse<POOrder>

// POCancel types
export interface POCancelRequest {
  moduleCode: string
  documentTypeCode: string
  runNo: string
  userName: string
  priorityStatus: string
}

export interface POCancelResponse {
  code: number
  msg: string | null
}
