export interface SeriesAndGroupDocResult {
  documentType: string
  yearForRunNo: number
  t: string
  e: string
  nextNumber: number
  formatDocNo: string
  documentNo: string
}

export interface SeriesAndGroupDocResponse {
  code: number
  msg: string | null
  result: SeriesAndGroupDocResult
}
