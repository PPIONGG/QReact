import { httpClient } from './httpClient'
import type { ApprovalRequest, ApprovalResponse } from '../types'

export async function submitApproval(
  request: ApprovalRequest,
  accessToken: string,
  packageCode: string
): Promise<ApprovalResponse> {
  return httpClient.post<ApprovalResponse>(`/api/Approved/Approve`, request, {
    accessToken,
    packageCode,
  })
}

export const approvalService = {
  submitApproval,
}
