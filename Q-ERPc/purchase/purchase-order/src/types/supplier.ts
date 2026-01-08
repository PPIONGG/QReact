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

export interface SupplierDetail {
  documentModuleCode: string
  documentTypeCode: string
  code: string
  prefixName: string
  currentName: string
  suffixName: string | null
  taxId: string
  phone: string | null
  email: string | null
  fax: string | null
  headQuaterOrBranch: string
  headQuaterOrBranchCode: string | null
  headQuaterOrBranchNameT: string | null
  category1: string | null
  category2: string | null
  category3: string | null
  category4: string | null
  category5: string | null
  category6: string | null
  deliveryType: string | null
  deliveryCode: string | null
  deliveryPrefix: string | null
  deliveryName: string | null
  deliverySuffix: string | null
  fullName: string | null
  fullAddress: string | null
  deliveryFullAddress: string | null
  paymentTermCode: string | null
  paymentTermTextPurchase: string | null
  payToCode: string | null
}

export interface SupplierDetailResponse {
  code: number
  msg: string | null
  result: SupplierDetail | null
}
