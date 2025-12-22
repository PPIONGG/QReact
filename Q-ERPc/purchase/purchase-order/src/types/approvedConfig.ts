export interface ApprovedDisplayColumn {
  field: string
  captionTH: string
  captionEN: string
}

export interface ApprovedAction {
  value: string
  labelTH: string
  labelEN: string
  type: 'Complete' | 'UnComplete' | 'Process' | 'Request'
}

export interface ApprovedLevel {
  level: number
  displayColumns: ApprovedDisplayColumn[]
  actions: ApprovedAction[]
}

export interface ApprovedConfigData {
  levels: ApprovedLevel[]
}

export interface ApprovedConfigResponse {
  status: boolean
  message: string
  messageE: string | null
  data: ApprovedConfigData | null
}
