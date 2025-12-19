import { useState, useEffect, useCallback, useRef } from 'react'
import { Modal, Table, Input, Flex, Alert } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useAuthStore } from '../stores'
import { getItemList } from '../services'
import type { ItemListItem } from '../types'

interface ItemSearchModalProps {
  open: boolean
  onCancel: () => void
  onSelect: (item: ItemListItem) => void
}

const PAGE_SIZE = 20
const SEARCH_DELAY = 500 // ms

export function ItemSearchModal({ open, onCancel, onSelect }: ItemSearchModalProps) {
  const { accessToken, companyCode } = useAuthStore()

  const [items, setItems] = useState<ItemListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  })

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchItems = useCallback(async (page: number, pageSize: number, search?: string) => {
    if (!accessToken || !companyCode) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await getItemList(accessToken, companyCode, page, pageSize, search)
      if (response.code === 0 && response.result) {
        setItems(response.result)
        setPagination({
          current: response.page,
          pageSize: response.pageSize,
          total: response.totalCount,
        })
      } else {
        setError(response.msg || 'ไม่สามารถโหลดข้อมูลสินค้าได้')
      }
    } catch (err) {
      console.error('Failed to fetch items:', err)
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, companyCode])

  // Fetch items when modal opens
  useEffect(() => {
    if (!open) return
    setSearchText('')
    fetchItems(1, PAGE_SIZE)
  }, [open, fetchItems])

  // Debounced search
  useEffect(() => {
    if (!open) return

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchItems(1, pagination.pageSize, searchText || undefined)
    }, SEARCH_DELAY)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchText, open, fetchItems, pagination.pageSize])

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    const page = paginationConfig.current || 1
    const pageSize = paginationConfig.pageSize || PAGE_SIZE
    fetchItems(page, pageSize, searchText || undefined)
  }

  const handleSelect = (item: ItemListItem) => {
    onSelect(item)
    onCancel()
  }

  const columns: ColumnsType<ItemListItem> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'ชื่อ(ไทย)',
      dataIndex: 'purchaseNameT',
      key: 'purchaseNameT',
      ellipsis: true,
    },
    {
      title: 'ชื่อ(อังกฤษ)',
      dataIndex: 'purchaseNameE',
      key: 'purchaseNameE',
      width: 180,
    },
  ]

  return (
    <Modal
      title="ค้นหาสินค้า"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Flex vertical gap={16}>
        <Input
          placeholder="ค้นหารหัส, ชื่อสินค้า..."
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
          dataSource={items}
          rowKey="code"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          size="small"
          rowClassName="item-row-hover"
          onRow={(record) => ({
            onDoubleClick: () => handleSelect(record),
            style: { cursor: 'pointer' },
          })}
          scroll={{ y: 400 }}
        />
        <style>{`
          .item-row-hover:hover td {
            background-color: #e6f7ff !important;
          }
        `}</style>
      </Flex>
    </Modal>
  )
}
