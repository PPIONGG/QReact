import { httpClient } from './httpClient'
import type { SeriesAndGroupDocResponse } from '../types'

export interface SeriesAndGroupDocParams {
  documentTypeCode: string
  yearForRunNo: number
  descT: string
  descEng: string
  docDate: string
}

/**
 * Get series and group document info for generating document number
 * Calls /api/Serie/SeriesAndGroupDoc API
 */
export async function getSeriesAndGroupDoc(
  params: SeriesAndGroupDocParams,
  accessToken: string,
  packageCode: string
): Promise<SeriesAndGroupDocResponse> {
  return httpClient.get<SeriesAndGroupDocResponse>(
    `/api/Serie/SeriesAndGroupDoc`,
    {
      accessToken,
      packageCode,
      params: {
        documentTypeCode: params.documentTypeCode,
        yearForRunNo: params.yearForRunNo,
        descT: params.descT,
        descEng: params.descEng,
        docDate: params.docDate,
      },
    }
  )
}

export const serieService = {
  getSeriesAndGroupDoc,
}
