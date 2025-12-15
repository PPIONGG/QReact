export interface Supplier {
  documentModuleCode: string
  documentTypeCode: string
  code: string
  prefixThai: string
  nameThai: string
  taxId: string
  suffixThai: string | null
  headQuaterOrBranch: string
  headQuaterOrBranchCode: string | null
  headQuaterOrBranchNameT: string | null
  recStatus: number
  paymentTermCode: string | null
}

export interface SupplierListResponse {
  code: number
  msg: string | null
  result: Supplier[]
}
