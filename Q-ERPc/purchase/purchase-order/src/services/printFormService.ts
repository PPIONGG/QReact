import { httpClient } from './httpClient'
import type { PrintFormListResponse, POReportPDFRequest } from '../types'

/**
 * Get print form list for a document type
 * Calls GET /api/Report/PrintFormList API
 *
 * @param documentTypePrintFormCode - Document type print form code (e.g., 'PODOG')
 * @param accessToken - Bearer token
 * @param packageCode - X-PACKAGE header value (also used as CompanyCode param)
 */
export async function getPrintFormList(
  documentTypePrintFormCode: string,
  accessToken: string,
  packageCode: string
): Promise<PrintFormListResponse> {
  return httpClient.get<PrintFormListResponse>(`/api/Report/PrintFormList`, {
    accessToken,
    packageCode,
    params: {
      CompanyCode: packageCode,
      DocumentTypePrintFormCode: documentTypePrintFormCode,
    },
  })
}

/**
 * Get PO Report as PDF Blob
 * Calls POST /api/Report/POReportPDF API
 *
 * @param request - POReportPDFRequest
 * @param accessToken - Bearer token
 * @param packageCode - X-PACKAGE header value
 * @returns PDF as Blob
 */
export async function getPOReportPDF(
  request: POReportPDFRequest,
  accessToken: string,
  packageCode: string
): Promise<Blob> {
  return httpClient.postBlob(`/api/Report/POReportPDF`, request, {
    accessToken,
    packageCode,
  })
}

export const printFormService = {
  getPrintFormList,
  getPOReportPDF,
}
