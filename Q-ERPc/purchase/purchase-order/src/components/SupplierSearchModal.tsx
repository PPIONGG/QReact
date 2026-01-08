import { useState, useEffect, useMemo, useRef } from 'react'
import { Modal, Table, Input, Flex, Alert } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAuthStore } from '../stores'
import { getSupplierList } from '../services'
import type { Supplier } from '../types'

interface SupplierSearchModalProps {
  open: boolean
  onCancel: () => void
  onSelect: (supplier: Supplier) => void
}

export function SupplierSearchModal({ open, onCancel, onSelect }: SupplierSearchModalProps) {
  const { accessToken, companyCode } = useAuthStore()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const hasFetched = useRef(false)

  // Fetch suppliers when modal opens (only once)
  useEffect(() => {
    if (!open || !accessToken || !companyCode) return
    // Skip if already fetched
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchSuppliers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getSupplierList(accessToken, companyCode)
        if (response.code === 0 && response.result) {
          setSuppliers(response.result)
        } else {
          setError(response.msg || 'ไม่สามารถโหลดข้อมูลผู้ขายได้')
        }
      } catch (err) {
        console.error('Failed to fetch suppliers:', err)
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuppliers()
  }, [open, accessToken, companyCode])

  // Filter suppliers based on search
  const filteredSuppliers = useMemo(() => {
    if (!searchText) return suppliers

    const search = searchText.toLowerCase()
    return suppliers.filter((s) =>
      s.code.toLowerCase().includes(search) ||
      s.nameThai.toLowerCase().includes(search) ||
      s.prefixThai?.toLowerCase().includes(search) ||
      s.taxId?.toLowerCase().includes(search)
    )
  }, [suppliers, searchText])

  const handleRowClick = (supplier: Supplier) => {
    onSelect(supplier)
    onCancel()
  }

  const columns: ColumnsType<Supplier> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'คำนำหน้า',
      dataIndex: 'prefixThai',
      key: 'prefixThai',
      width: 120,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'nameThai',
      key: 'nameThai',
    },
    {
      title: 'เลขประจำตัวผู้เสียภาษี',
      dataIndex: 'taxId',
      key: 'taxId',
      width: 150,
    },
  ]

  return (
    <Modal
      title="ค้นหาผู้ขาย"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Flex vertical gap={16}>
        <Input
          placeholder="ค้นหารหัส, ชื่อ, เลขประจำตัวผู้เสียภาษี..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        {error && (
          <Alert message={error} type="error" showIcon />
        )}

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="code"
          loading={isLoading}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          size="small"
          rowClassName="supplier-row-hover"
          onRow={(record) => ({
            onDoubleClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          scroll={{ y: 400 }}
        />
        <style>{`
          .supplier-row-hover:hover td {
            background-color: #e6f7ff !important;
          }
        `}</style>
      </Flex>
    </Modal>
  )
}
