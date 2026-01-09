// import type { ApiResponse } from './permission'

import type { ApiResponse } from "@qerp/shared"

// import type { ApiResponse } from "../../../../../shared/src/types/api"

// Approval status for each level
export interface ApprovalStatus {
  level: number
  status: string | null
  canApprove: boolean
}

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
  approvedStatus01: string | null
  approvedByName01: string | null
  approvedByLastDated01: string | null
  approvedStatus02: string | null
  approvedByName02: string | null
  approvedByLastDated02: string | null
  approvedStatus03: string | null
  approvedStatus04: string | null
  approvedStatus05: string | null
  deliveryStatus: string
  deliveryStatusComplete: string
  currencyCode: string
  currencyNameThai: string
  currencyNameEng: string
  totalAmountCurrencyAfterVat: number
  recStatus: number
  lastUpdated: string
  updatedUser: string
  approvalStatuses: ApprovalStatus[]
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
  vatBasedForVATAmountCurrency: number
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
