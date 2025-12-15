/** Document Type from API */
export interface DocumentType {
  moduleCode: string
  documentTypeCode: string
  vline: number
  moduleDescription: string
  moduleDescriptionEx: string | null
  documentTypeCodeDescriptionT: string
  documentTypeCodeDescriptionE: string
  docType1: string
  docType1Name: string
  docType1NameE: string
  docType2: string
  docType2Name: string
  docType2NameE: string
  docType3: string
  docType3Name: string
  docType3NameE: string
  docType4: string
  docType4Name: string
  docType4NameE: string
  docType5: string
  docType5Name: string
  docType5NameE: string
  note: string | null
  useValue: string
  thorEn: string
  recStatus: number
  lastUpdated: string
  updatedUser: string
  whcode: string | null
  branchCode: string | null
}

/** API Response for DocumentTypeRightList */
export interface DocumentTypeRightListResponse {
  code: number
  msg: string | null
  result: DocumentType[]
}
