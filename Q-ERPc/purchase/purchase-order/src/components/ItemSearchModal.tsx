import { useState, useEffect, useMemo } from 'react'
import { Modal, Table, Input, Flex, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAuthStore } from '../stores'
import { getItemList } from '../services'
import type { ItemListItem } from '../types'

interface ItemSearchModalProps {
  open: boolean
  onCancel: () => void
  onSelect: (item: ItemListItem) => void
}

export function ItemSearchModal({ open, onCancel, onSelect }: ItemSearchModalProps) {
  const { accessToken, companyCode } = useAuthStore()

  const [items, setItems] = useState<ItemListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Fetch items when modal opens
  useEffect(() => {
    if (!open || !accessToken || !companyCode) return

    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const response = await getItemList(accessToken, companyCode)
        if (response.code === 0 && response.result) {
          setItems(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [open, accessToken, companyCode])

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchText) return items

    const search = searchText.toLowerCase()
    return items.filter((item) =>
      item.code.toLowerCase().includes(search) ||
      item.purchaseNameT?.toLowerCase().includes(search) ||
      item.purchaseNameE?.toLowerCase().includes(search) ||
      item.t?.toLowerCase().includes(search)
    )
  }, [items, searchText])

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
    {
      title: 'เลือก',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelect(record)}
        >
          เลือก
        </Button>
      ),
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

        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="code"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          size="small"
          rowClassName="item-row-hover"
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
