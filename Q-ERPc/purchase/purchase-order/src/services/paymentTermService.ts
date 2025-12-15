import { httpClient } from './httpClient'
import type { PaymentTermListResponse, CalculatePaymentResponse } from '../types'

/**
 * Get payment term list
 * Calls /api/PaymentTerm/PaymentTermList API
 */
export async function getPaymentTermList(
  accessToken: string,
  packageCode: string
): Promise<PaymentTermListResponse> {
  return httpClient.get<PaymentTermListResponse>(`/api/PaymentTerm/PaymentTermList`, {
    accessToken,
    packageCode,
  })
}

/**
 * Calculate payment due date based on payment term and reference date
 * Calls /api/PaymentTerm/CalculatePayment API
 */
export async function calculatePaymentDueDate(
  paymentTermCode: string,
  refDate: string, // Format: DD/MM/YYYY
  accessToken: string,
  packageCode: string
): Promise<CalculatePaymentResponse> {
  return httpClient.get<CalculatePaymentResponse>(
    `/api/PaymentTerm/CalculatePayment?PaymentTermCode=${encodeURIComponent(paymentTermCode)}&refDate=${encodeURIComponent(refDate)}`,
    {
      accessToken,
      packageCode,
    }
  )
}

export const paymentTermService = {
  getPaymentTermList,
  calculatePaymentDueDate,
}
