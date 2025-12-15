import { httpClient } from './httpClient'
import type { DocumentTypeRightListResponse } from '../types'

/**
 * Get document type list for a module
 * Calls /api/Document/DocumentTypeRightList API
 *
 * @param moduleCode - Module code (e.g., 'PO' for Purchase Order)
 * @param userName - Username
 * @param accessToken - Bearer token
 * @param packageCode - X-PACKAGE header value
 */
export async function getDocumentTypeRightList(
  moduleCode: string,
  userName: string,
  accessToken: string,
  packageCode: string
): Promise<DocumentTypeRightListResponse> {
  return httpClient.get<DocumentTypeRightListResponse>(
    `/api/Document/DocumentTypeRightList`,
    {
      accessToken,
      packageCode,
      params: {
        ModuleCode: moduleCode,
        UserName: userName,
      },
    }
  )
}

export const documentService = {
  getDocumentTypeRightList,
}
