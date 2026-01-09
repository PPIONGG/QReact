// CheckStatus API types
// POST /api/PO/CheckStatus

export type CheckStatusMode = 'Edit' | 'Cancel'

export interface CheckStatusRequest {
  documentModuleCode: string
  documentTypeCode: string
  runNo: number
  mode: CheckStatusMode
}

export interface CheckStatusCurrentStatus {
  recStatus: number
  approvedStatus01: string | null
  approvedStatus02: string | null
  approvedStatus03: string | null
  approvedStatus04: string | null
  approvedStatus05: string | null
  deliveryStatus: string
  deliveryStatusComplete: string
}

export interface CheckStatusResult {
  canProceed: boolean
  message: string | null
  messageEN: string | null
  warningMessage: string | null
  currentStatus: CheckStatusCurrentStatus
}

export interface CheckStatusResponse {
  code: number
  msg: string | null
  result: CheckStatusResult | null
}
