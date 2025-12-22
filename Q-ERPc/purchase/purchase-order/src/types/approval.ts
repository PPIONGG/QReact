export interface ApprovalRequest {
  moduleCode: string
  documentTypeCode: string
  runNo: number
  level: number
  action: string
  comment: string
  userName: string
}

export interface ApprovalResponse {
  status: boolean
  message: string
  messageE: string | null
  data: unknown
}
