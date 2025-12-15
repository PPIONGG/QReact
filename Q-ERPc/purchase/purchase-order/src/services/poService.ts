import { httpClient } from './httpClient'
import type {
  POHeaderListResponse,
  POInsertRequest,
  POInsertResponse,
  POUpdateResponse,
  POOrderResponse,
  POCancelRequest,
  POCancelResponse,
} from '../types'

/**
 * Get PO header list
 * Calls /api/PO/POHeaderList API
 *
 * @param documentTypeCode - Document type code (e.g., 'PODOG')
 * @param accessToken - Bearer token
 * @param packageCode - X-PACKAGE header value
 */
export async function getPOHeaderList(
  documentTypeCode: string,
  accessToken: string,
  packageCode: string
): Promise<POHeaderListResponse> {
  return httpClient.get<POHeaderListResponse>(`/api/PO/POHeaderList`, {
    accessToken,
    packageCode,
    params: {
      DocumentTypeCode: documentTypeCode,
    },
  })
}

/**
 * Insert new PO
 * Calls POST /api/PO/POInsert API
 */
export async function poInsert(
  request: POInsertRequest,
  accessToken: string,
  packageCode: string
): Promise<POInsertResponse> {
  return httpClient.post<POInsertResponse>(`/api/PO/POInsert`, request, {
    accessToken,
    packageCode,
  })
}

/**
 * Get PO order detail for edit mode
 * Calls GET /api/PO/POOrder API
 */
export async function getPOOrder(
  moduleCode: string,
  documentTypeCode: string,
  runNo: number,
  userName: string,
  accessToken: string,
  packageCode: string
): Promise<POOrderResponse> {
  return httpClient.get<POOrderResponse>(`/api/PO/POOrder`, {
    accessToken,
    packageCode,
    params: {
      moduleCode,
      documentTypeCode,
      runNo,
      userName,
    },
  })
}

/**
 * Update existing PO
 * Calls POST /api/PO/POUpdate API
 */
export async function poUpdate(
  request: POInsertRequest,
  accessToken: string,
  packageCode: string
): Promise<POUpdateResponse> {
  return httpClient.post<POUpdateResponse>(`/api/PO/POUpdate`, request, {
    accessToken,
    packageCode,
  })
}

/**
 * Cancel PO
 * Calls POST /api/PO/POCancel API
 */
export async function poCancel(
  request: POCancelRequest,
  accessToken: string,
  packageCode: string
): Promise<POCancelResponse> {
  return httpClient.post<POCancelResponse>(`/api/PO/POCancel`, request, {
    accessToken,
    packageCode,
  })
}

export const poService = {
  getPOHeaderList,
  poInsert,
  poUpdate,
  getPOOrder,
  poCancel,
}
