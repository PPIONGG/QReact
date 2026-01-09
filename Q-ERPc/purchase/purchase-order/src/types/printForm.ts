// Print Form types

export interface PrintForm {
  companyCode: string
  documentTypePrintFormCode: string
  orderPrintFormInDocumentTypePrintForm: number
  remark: string
}

export interface PrintFormListResponse {
  code: number
  msg: string | null
  result: PrintForm[] | null
}

// POReportPDF API types
export interface POReportPDFRequest {
  CompanyCode: string
  DocumentTypeCode: string
  RunNo: number
  DocumentTypePrintFormCode: string
  OrderPrintFormInDocumentTypePrintForm: number
}

export interface POReportPDFResponse {
  code: number
  msg: string | null
  result: string | null  // Base64 PDF string
}
