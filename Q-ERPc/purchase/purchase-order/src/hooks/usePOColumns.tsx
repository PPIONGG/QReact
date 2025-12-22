import { useMemo } from 'react'
import { Tag, Button, Dropdown } from 'antd'
import { EditOutlined, EyeOutlined, PrinterOutlined, StopOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { ColumnsType, ColumnType } from 'antd/es/table'
import type { POHeader } from '../types'
import dayjs from 'dayjs'
import { getApprovalStatus, getDeliveryStatus, getRecStatus } from '../utils'
import { ColumnSelector, type ColumnConfig } from '../components/ColumnSelector'

// Column configurations for the selector
export const PO_COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'index', title: 'ลำดับ', required: true },
  { key: 'pono', title: 'เลขที่ใบสั่งซื้อ', required: true },
  { key: 'podate', title: 'วันที่เอกสาร' },
  { key: 'supplierName', title: 'ชื่อผู้ขาย' },
  { key: 'approvedStatus01', title: 'สถานะอนุมัติ' },
  { key: 'deliveryStatus', title: 'สถานะรับสินค้า' },
  { key: 'recStatus', title: 'สถานะ' },
  { key: 'lastUpdated', title: 'แก้ไขล่าสุด' },
  { key: 'updatedUser', title: 'โดย' },
  { key: 'action', title: 'ตัวเลือก', required: true },
]

// Get default visible columns (all columns)
export const getDefaultVisibleColumns = (): string[] => PO_COLUMN_CONFIGS.map((c) => c.key)

interface UsePOColumnsProps {
  onEdit: (runNo: number) => void
  onView: (record: POHeader) => void
  onCancel: (record: POHeader) => void
  onPrint: (record: POHeader) => void
  visibleColumns?: string[]
  onVisibleColumnsChange?: (columns: string[]) => void
}

export function usePOColumns({
  onEdit,
  onView,
  onCancel,
  onPrint,
  visibleColumns,
  onVisibleColumnsChange,
}: UsePOColumnsProps) {
  const allColumns: ColumnsType<POHeader> = useMemo(
    () => [
      {
        title: 'ลำดับ',
        key: 'index',
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        title: 'เลขที่ใบสั่งซื้อ',
        dataIndex: 'pono',
        key: 'pono',
        width: 140,
      },
      {
        title: 'วันที่เอกสาร',
        dataIndex: 'podate',
        key: 'podate',
        width: 110,
        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      },
      {
        title: 'ชื่อผู้ขาย',
        dataIndex: 'supplierName',
        key: 'supplierName',
      },
      {
        title: 'สถานะอนุมัติ',
        dataIndex: 'approvedStatus01',
        key: 'approvedStatus01',
        width: 100,
        align: 'center',
        render: (status: string) => {
          const { text, color } = getApprovalStatus(status)
          return <Tag color={color}>{text}</Tag>
        },
      },
      {
        title: 'สถานะรับสินค้า',
        dataIndex: 'deliveryStatus',
        key: 'deliveryStatus',
        width: 110,
        align: 'center',
        render: (status: string) => {
          const { text, color } = getDeliveryStatus(status)
          return <Tag color={color}>{text}</Tag>
        },
      },
      {
        title: 'สถานะ',
        dataIndex: 'recStatus',
        key: 'recStatus',
        width: 80,
        align: 'center',
        render: (status: number) => {
          const { text, color } = getRecStatus(status)
          return <Tag color={color}>{text}</Tag>
        },
      },
      {
        title: 'แก้ไขล่าสุด',
        dataIndex: 'lastUpdated',
        key: 'lastUpdated',
        width: 140,
        render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      },
      {
        title: 'โดย',
        dataIndex: 'updatedUser',
        key: 'updatedUser',
        width: 100,
        align: 'center',
      },
      {
        title: onVisibleColumnsChange ? (
          <ColumnSelector
            columns={PO_COLUMN_CONFIGS}
            visibleColumns={visibleColumns || getDefaultVisibleColumns()}
            onChange={onVisibleColumnsChange}
          />
        ) : (
          'ตัวเลือก'
        ),
        key: 'action',
        width: 80,
        minWidth: 80,
        maxWidth: 80,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const isDisabled = record.recStatus === 1
          const menuItems = [
            {
              key: 'edit',
              label: 'แก้ไข',
              icon: <EditOutlined />,
              disabled: isDisabled,
              onClick: () => onEdit(record.runNo),
            },
            {
              key: 'cancel',
              label: 'ยกเลิกเอกสาร',
              icon: <StopOutlined />,
              disabled: isDisabled,
              onClick: () => onCancel(record),
            },
            {
              key: 'view',
              label: 'ดูรายละเอียด',
              icon: <EyeOutlined />,
              disabled: isDisabled,
              onClick: () => onView(record),
            },
            {
              key: 'print',
              label: 'พิมพ์',
              icon: <PrinterOutlined />,
              disabled: isDisabled,
              onClick: () => onPrint(record),
            },
          ]

          return (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['hover']}
              placement="bottomRight"
              disabled={isDisabled}
            >
              <Button
                type="text"
                size="small"
                icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
                disabled={isDisabled}
              />
            </Dropdown>
          )
        },
      },
    ],
    [onEdit, onView, onCancel, onPrint, onVisibleColumnsChange, visibleColumns]
  )

  // Filter columns based on visibility
  const columns = useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      return allColumns
    }
    return allColumns.filter((col) => {
      const key = (col as ColumnType<POHeader>).key as string
      return visibleColumns.includes(key)
    })
  }, [allColumns, visibleColumns])

  return columns
}
