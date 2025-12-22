import { Popover, Tag, Button, Space } from 'antd'
import { CaretDownOutlined } from '@ant-design/icons'
import type { ApprovedAction } from '../types'
import { getApprovalStatusFromConfig } from '../utils'

export interface ApprovalActionParams {
  runNo: number
  level: number
  action: 'approve' | 'reject' | 'cancel'
}

interface ApprovalStatusTagProps {
  status: string
  actions: ApprovedAction[]
  runNo: number
  level: number
  disabled?: boolean
  onAction?: (params: ApprovalActionParams) => void
}

export function ApprovalStatusTag({
  status,
  actions,
  runNo,
  level,
  disabled = false,
  onAction,
}: ApprovalStatusTagProps) {
  const { text, color } = getApprovalStatusFromConfig(status, actions)

  const handleAction = (action: 'approve' | 'reject' | 'cancel') => {
    console.log('🔔 Approval Action:', { runNo, level, action, currentStatus: status })
    onAction?.({ runNo, level, action })
  }

  // Level 2 แสดง "รออนุมัติ" แทน "ยกเลิก"
  const cancelButtonText = level === 2 ? 'รออนุมัติ' : 'ยกเลิก'

  const content = (
    <Space size="small">
      <Button
        type="text"
        size="small"
        style={{ color: '#52c41a' }}
        onClick={() => handleAction('approve')}
      >
        อนุมัติ
      </Button>
      <Button
        type="text"
        size="small"
        style={{ color: '#ff4d4f' }}
        onClick={() => handleAction('reject')}
      >
        ไม่อนุมัติ
      </Button>
      <Button
        type="text"
        size="small"
        style={{ color: '#8c8c8c' }}
        onClick={() => handleAction('cancel')}
      >
        {cancelButtonText}
      </Button>
    </Space>
  )

  // ถ้า disabled ให้แสดง Tag ธรรมดา
  if (disabled) {
    return (
      <Tag color={color} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
        {text || '-'}
      </Tag>
    )
  }

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottom"
      arrow={false}
    >
      <Tag color={color || 'default'} style={{ cursor: 'pointer' }}>
        {text || '-'} <CaretDownOutlined style={{ fontSize: 10 }} />
      </Tag>
    </Popover>
  )
}
