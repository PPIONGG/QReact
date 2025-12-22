import { Flex, Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface DocumentTypeOption {
  value: string
  label: string
}

interface POSearchFilterProps {
  documentTypeOptions: DocumentTypeOption[]
  selectedDocumentType: string | undefined
  onDocumentTypeChange: (value: string) => void
  searchText: string
  onSearchChange: (value: string) => void
  isLoadingDocTypes: boolean
}

export function POSearchFilter({
  documentTypeOptions,
  selectedDocumentType,
  onDocumentTypeChange,
  searchText,
  onSearchChange,
  isLoadingDocTypes,
}: POSearchFilterProps) {
  return (
    <Flex gap={16} style={{ marginBottom: 16 }} wrap="wrap">
      <Select
        placeholder="ประเภทเอกสาร"
        value={selectedDocumentType}
        onChange={onDocumentTypeChange}
        style={{ width: 250 }}
        loading={isLoadingDocTypes}
        options={documentTypeOptions}
      />
      <Input
        placeholder="ค้นหาเลขที่ PO, ผู้ขาย..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: 1, minWidth: 200 }}
        allowClear
      />
    </Flex>
  )
}
