import { useMemo } from 'react'
import { Tag, Button, Dropdown } from 'antd'
import { EditOutlined, EyeOutlined, PrinterOutlined, StopOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { ColumnsType, ColumnType } from 'antd/es/table'
import type { POHeader, ApprovedAction, ApprovedLevel } from '../types'
import dayjs from 'dayjs'
import { getDeliveryStatus, getRecStatus } from '../utils'
import { ColumnSelector, type ColumnConfig } from '../components/ColumnSelector'
import { ApprovalStatusTag, type ApprovalActionParams } from '../components/ApprovalStatusTag'

// Base column configurations (without approval columns)
const BASE_COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'index', title: 'ลำดับ', required: true },
  { key: 'pono', title: 'เลขที่ใบสั่งซื้อ', required: true },
  { key: 'podate', title: 'วันที่เอกสาร' },
  { key: 'supplierName', title: 'ชื่อผู้ขาย' },
  { key: 'currencyCode', title: 'สกุลเงิน' },
  { key: 'totalAmountCurrencyAfterVat', title: 'จำนวนเงิน' },
]

const AFTER_APPROVAL_CONFIGS: ColumnConfig[] = [
  { key: 'deliveryStatus', title: 'สถานะรับสินค้า' },
  { key: 'recStatus', title: 'สถานะ' },
  { key: 'lastUpdated', title: 'แก้ไขล่าสุด' },
  { key: 'updatedUser', title: 'โดย' },
  { key: 'action', title: 'ตัวเลือก', required: true },
]

// Generate approval column configs for a level
function getApprovalColumnConfigsForLevel(level: number, displayColumns: { field: string; captionTH: string }[]): ColumnConfig[] {
  const levelStr = level.toString().padStart(2, '0')
  return displayColumns.map((col) => ({
    key: `${col.field}${levelStr}`,
    title: col.captionTH,
  }))
}

// Generate column configs dynamically based on configured levels
export function generateColumnConfigs(configuredLevels: ApprovedLevel[]): ColumnConfig[] {
  const approvalConfigs: ColumnConfig[] = []

  configuredLevels.forEach((level) => {
    approvalConfigs.push(...getApprovalColumnConfigsForLevel(level.level, level.displayColumns))
  })

  return [...BASE_COLUMN_CONFIGS, ...approvalConfigs, ...AFTER_APPROVAL_CONFIGS]
}

// Legacy static config for backward compatibility
export const PO_COLUMN_CONFIGS: ColumnConfig[] = [
  ...BASE_COLUMN_CONFIGS,
  { key: 'approvedStatus01', title: 'สถานะอนุมัติ' },
  { key: 'approvedByName01', title: 'ชื่อผู้อนุมัติ' },
  { key: 'approvedByLastDated01', title: 'วันที่อนุมัติ' },
  { key: 'approvedStatus02', title: 'สถานะอนุมัติผู้บริหาร' },
  { key: 'approvedByName02', title: 'ชื่อผู้อนุมัติผู้บริหาร' },
  { key: 'approvedByLastDated02', title: 'วันที่อนุมัติผู้บริหาร' },
  ...AFTER_APPROVAL_CONFIGS,
]

// Get default visible columns (all columns)
export const getDefaultVisibleColumns = (): string[] => PO_COLUMN_CONFIGS.map((c) => c.key)

// Get default visible columns based on configured levels
export function getDefaultVisibleColumnsFromConfig(configuredLevels: ApprovedLevel[]): string[] {
  return generateColumnConfigs(configuredLevels).map((c) => c.key)
}

interface UsePOColumnsProps {
  onEdit: (record: POHeader) => void
  onView: (record: POHeader) => void
  onCancel: (record: POHeader) => void
  onPrint: (record: POHeader) => void
  onApprovalAction?: (params: ApprovalActionParams) => void
  visibleColumns?: string[]
  onVisibleColumnsChange?: (columns: string[]) => void
  configuredLevels?: ApprovedLevel[]
  actionsByLevel?: Record<number, ApprovedAction[]>
  // Legacy props for backward compatibility
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
  configuredLevels = [],
  actionsByLevel = {},
  approvedActions01 = [],
  approvedActions02 = [],
}: UsePOColumnsProps) {
  // Generate dynamic column configs based on configured levels
  const dynamicColumnConfigs = useMemo(() => {
    if (configuredLevels.length > 0) {
      return generateColumnConfigs(configuredLevels)
    }
    return PO_COLUMN_CONFIGS
  }, [configuredLevels])

  // Base columns (always present)
  const baseColumns: ColumnsType<POHeader> = useMemo(
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
        dataIndex: 'currencyNameThai',
        key: 'currencyCode',
        width: 160,
      },
      {
        title: 'จำนวนเงิน',
        dataIndex: 'totalAmountCurrencyAfterVat',
        key: 'totalAmountCurrencyAfterVat',
        width: 140,
        align: 'right',
        render: (value: number) => value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-',
      },
    ],
    []
  )

  // Generate approval columns dynamically
  const approvalColumns: ColumnsType<POHeader> = useMemo(() => {
    console.log('🔍 usePOColumns - configuredLevels:', configuredLevels.length, configuredLevels)
    console.log('🔍 usePOColumns - actionsByLevel:', actionsByLevel)

    // If using new dynamic config
    if (configuredLevels.length > 0) {
      const columns: ColumnsType<POHeader> = []

      configuredLevels.forEach((levelConfig) => {
        const level = levelConfig.level
        const actions = actionsByLevel[level] || []

        levelConfig.displayColumns.forEach((displayCol) => {
          // API returns field with level suffix already (e.g., "ApprovedStatus01")
          // Convert to lowercase for dataIndex to match POHeader type
          const fieldLower = displayCol.field.charAt(0).toLowerCase() + displayCol.field.slice(1)
          const key = fieldLower
          const dataIndex = fieldLower

          // Check field name (case-insensitive)
          const fieldBase = displayCol.field.replace(/\d+$/, '').toLowerCase()
          if (fieldBase === 'approvedstatus') {
            columns.push({
              title: displayCol.captionTH,
              dataIndex,
              key,
              width: 120,
              render: (status: string, record: POHeader) => {
                // Find approval status flags for this level
                const approvalStatus = record.approvalStatuses?.find((s) => s.level === level)
                return (
                  <ApprovalStatusTag
                    status={status}
                    actions={actions}
                    approvalStatus={approvalStatus}
                    runNo={record.runNo}
                    level={level}
                    disabled={record.recStatus === 1}
                    onAction={onApprovalAction}
                  />
                )
              },
            })
          } else if (fieldBase === 'approvedbylastdated') {
            columns.push({
              title: displayCol.captionTH,
              dataIndex,
              key,
              width: 140,
              render: (date: string | null) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
            })
          } else {
            columns.push({
              title: displayCol.captionTH,
              dataIndex,
              key,
              width: 120,
            })
          }
        })
      })

      return columns
    }

    // Fallback to legacy hardcoded columns
    return [
      {
        title: 'สถานะอนุมัติ',
        dataIndex: 'approvedStatus01',
        key: 'approvedStatus01',
        width: 100,
        render: (status: string, record: POHeader) => {
          const approvalStatus = record.approvalStatuses?.find((s) => s.level === 1)
          return (
            <ApprovalStatusTag
              status={status}
              actions={approvedActions01}
              approvalStatus={approvalStatus}
              runNo={record.runNo}
              level={1}
              disabled={record.recStatus === 1}
              onAction={onApprovalAction}
            />
          )
        },
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
        render: (status: string, record: POHeader) => {
          const approvalStatus = record.approvalStatuses?.find((s) => s.level === 2)
          return (
            <ApprovalStatusTag
              status={status}
              actions={approvedActions02}
              approvalStatus={approvalStatus}
              runNo={record.runNo}
              level={2}
              disabled={record.recStatus === 1}
              onAction={onApprovalAction}
            />
          )
        },
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
    ]
  }, [configuredLevels, actionsByLevel, approvedActions01, approvedActions02, onApprovalAction])

  // After approval columns (always present)
  const afterApprovalColumns: ColumnsType<POHeader> = useMemo(
    () => [
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
            columns={dynamicColumnConfigs}
            visibleColumns={visibleColumns || dynamicColumnConfigs.map((c) => c.key)}
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
              onClick: () => onEdit(record),
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
    [onEdit, onView, onCancel, onPrint, onVisibleColumnsChange, visibleColumns, dynamicColumnConfigs]
  )

  // Combine all columns
  const allColumns: ColumnsType<POHeader> = useMemo(
    () => [...baseColumns, ...approvalColumns, ...afterApprovalColumns],
    [baseColumns, approvalColumns, afterApprovalColumns]
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
