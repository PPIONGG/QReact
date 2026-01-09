import { useMemo } from 'react'
import { Tag, Button, Dropdown } from 'antd'
import { EditOutlined, EyeOutlined, PrinterOutlined, StopOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { ColumnsType, ColumnType } from 'antd/es/table'
import type { POHeader, ApprovedAction } from '../types'
import dayjs from 'dayjs'
import { getDeliveryStatus, getRecStatus } from '../utils'
import { ColumnSelector, type ColumnConfig } from '../components/ColumnSelector'
import { ApprovalStatusTag, type ApprovalActionParams } from '../components/ApprovalStatusTag'

// Column configurations for the selector
export const PO_COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'index', title: 'ลำดับ', required: true },
  { key: 'pono', title: 'เลขที่ใบสั่งซื้อ', required: true },
  { key: 'podate', title: 'วันที่เอกสาร' },
  { key: 'supplierName', title: 'ชื่อผู้ขาย' },
  { key: 'currencyCode', title: 'สกุลเงิน' },
  { key: 'totalAmountCurrencyAfterVat', title: 'จำนวนเงิน' },
  { key: 'approvedStatus01', title: 'สถานะอนุมัติ' },
  { key: 'approvedByName01', title: 'ชื่อผู้อนุมัติ' },
  { key: 'approvedByLastDated01', title: 'วันที่อนุมัติ' },
  { key: 'approvedStatus02', title: 'สถานะอนุมัติผู้บริหาร' },
  { key: 'approvedByName02', title: 'ชื่อผู้อนุมัติผู้บริหาร' },
  { key: 'approvedByLastDated02', title: 'วันที่อนุมัติผู้บริหาร' },
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
  onApprovalAction?: (params: ApprovalActionParams) => void
  visibleColumns?: string[]
  onVisibleColumnsChange?: (columns: string[]) => void
  approvedActions01?: ApprovedAction[]
  approvedActions02?: ApprovedAction[]
}

export function usePOColumns({
  onEdit,
  onView,
  onCancel,
  onPrint,
  onApprovalAction,
  visibleColumns,
  onVisibleColumnsChange,
  approvedActions01 = [],
  approvedActions02 = [],
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
        title: 'สกุลเงิน',
        dataIndex: 'currencyCode',
        key: 'currencyCode',
        width: 80,
        align: 'center',
      },
      {
        title: 'จำนวนเงิน',
        dataIndex: 'totalAmountCurrencyAfterVat',
        key: 'totalAmountCurrencyAfterVat',
        width: 140,
        align: 'right',
        render: (value: number) => value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-',
      },
      {
        title: 'สถานะอนุมัติ',
        dataIndex: 'approvedStatus01',
        key: 'approvedStatus01',
        width: 100,
        render: (status: string, record: POHeader) => (
          <ApprovalStatusTag
            status={status}
            actions={approvedActions01}
            runNo={record.runNo}
            level={1}
            disabled={record.recStatus === 1 || record.approvedStatus02 === 'Y' || record.approvedStatus02 === 'N'}
            onAction={onApprovalAction}
          />
        ),
      },
      {
        title: 'ชื่อผู้อนุมัติ',
        dataIndex: 'approvedByName01',
        key: 'approvedByName01',
        width: 120,
      },
      {
        title: 'วันที่อนุมัติ',
        dataIndex: 'approvedByLastDated01',
        key: 'approvedByLastDated01',
        width: 140,
        render: (date: string | null) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
      },
      {
        title: 'สถานะอนุมัติผู้บริหาร',
        dataIndex: 'approvedStatus02',
        key: 'approvedStatus02',
        width: 140,
        render: (status: string, record: POHeader) => (
          <ApprovalStatusTag
            status={status}
            actions={approvedActions02}
            runNo={record.runNo}
            level={2}
            disabled={record.recStatus === 1 || record.approvedStatus01 !== 'Y'}
            onAction={onApprovalAction}
          />
        ),
      },
      {
        title: 'ชื่อผู้อนุมัติผู้บริหาร',
        dataIndex: 'approvedByName02',
        key: 'approvedByName02',
        width: 140,
      },
      {
        title: 'วันที่อนุมัติผู้บริหาร',
        dataIndex: 'approvedByLastDated02',
        key: 'approvedByLastDated02',
        width: 150,
        render: (date: string | null) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
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
          const { text } = getRecStatus(status)
          return text
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
              trigger={['click']}
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
    [onEdit, onView, onCancel, onPrint, onApprovalAction, onVisibleColumnsChange, visibleColumns, approvedActions01, approvedActions02]
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
