export interface PaymentTerm {
  code: string
  descriptionOnSalesThai: string
  descriptionOnPurchaseThai: string
  descriptionOnSalesEng: string
  descriptionOnPurchaseEng: string
  daysToDue: number
  startCountingFromFlag: string
  recStatus: number
}

export interface PaymentTermListResponse {
  code: number
  msg: string | null
  result: PaymentTerm[]
}

export interface CalculatePaymentResponse {
  code: number
  msg: string | null
  result: string // ISO date string e.g. "2026-04-11T00:00:00"
}
