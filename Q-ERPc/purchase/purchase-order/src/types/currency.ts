export interface Currency {
  code: string
  t: string // Thai description
  e: string // English description
}

export interface CurrencyListResponse {
  code: number
  msg: string | null
  result: Currency[]
}
