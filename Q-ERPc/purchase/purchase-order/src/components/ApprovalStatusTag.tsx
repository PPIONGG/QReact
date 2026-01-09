import { Dropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { ApprovedAction, ApprovalStatus } from '../types'
import { getApprovalStatusFromConfig } from '../utils'

export interface ApprovalActionParams {
  runNo: number
  level: number
  action: 'approve' | 'reject' | 'cancel'
}

interface ApprovalStatusTagProps {
  status: string
  actions: ApprovedAction[]
  approvalStatus?: ApprovalStatus  // Flags to filter available actions
  runNo: number
  level: number
  disabled?: boolean
  onAction?: (params: ApprovalActionParams) => void
}

// Jira-style status colors (3 colors only)
// เขียว = อนุมัติ (Y), ฟ้า = ไม่อนุมัติ (N), เทา = รออนุมัติ (W, P) หรือว่าง
const STATUS_STYLES: Record<string, { bg: string; text: string; hoverBg: string }> = {
  green: { bg: '#b3df72', text: '#1f2937', hoverBg: '#a6d65c' },
  blue: { bg: '#8fb8f6', text: '#1f2937', hoverBg: '#7aa0f0' },
  gray: { bg: '#f3f4f6', text: '#1f2937', hoverBg: '#e5e7eb' },
}

// Map status value to color
const getStatusColor = (statusValue: string): 'green' | 'blue' | 'gray' => {
  if (statusValue === 'Y') return 'green'
  if (statusValue === 'N') return 'blue'
  return 'gray'
}

// Map action to approval action type
const getActionType = (actionValue: string): 'approve' | 'reject' | 'cancel' => {
  if (actionValue === 'Y') return 'approve'
  if (actionValue === 'N') return 'reject'
  return 'cancel'
}

// Check if action is allowed based on approval status flags
const isActionAllowed = (action: ApprovedAction, approvalStatus?: ApprovalStatus): boolean => {
  if (!approvalStatus?.actionPermissions) return true // If no flags provided, allow all

  const permissions = approvalStatus.actionPermissions
  switch (action.type) {
    case 'Complete':
      return permissions.Complete === true
    case 'UnComplete':
      return permissions.UnComplete === true
    case 'Process':
      return permissions.Process === true
    case 'Request':
      return permissions.Request === true
    default:
      return true
  }
}

// Check if all flags are false (or missing)
const areAllFlagsFalse = (approvalStatus?: ApprovalStatus): boolean => {
  if (!approvalStatus?.actionPermissions) return false
  const p = approvalStatus.actionPermissions
  return !p.Complete && !p.Process && !p.UnComplete && !p.Request
}

export function ApprovalStatusTag({
  status,
  actions,
  approvalStatus,
  runNo,
  level,
  disabled = false,
  onAction,
}: ApprovalStatusTagProps) {
  console.log(`🏷️ ApprovalStatusTag Level ${level}:`, { status, actionsCount: actions.length, disabled, runNo, approvalStatus })
  const { text } = getApprovalStatusFromConfig(status, actions)
  const colorKey = getStatusColor(status)
  const style = STATUS_STYLES[colorKey]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const actionType = getActionType(key)
    console.log('🔔 Approval Action:', { runNo, level, action: actionType, newStatus: key })
    onAction?.({ runNo, level, action: actionType })
  }

  // Check if all flags are false - completely disable (no dropdown)
  const allFlagsFalse = areAllFlagsFalse(approvalStatus)

  // Build menu items from actions config (exclude current status and filter by flags)
  const menuItems: MenuProps['items'] = actions
    .filter((action) => action.value !== status && isActionAllowed(action, approvalStatus))
    .map((action) => {
      const itemColorKey = getStatusColor(action.value)
      const itemStyle = STATUS_STYLES[itemColorKey]

      return {
        key: action.value,
        label: (
          <span style={{
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: itemStyle.bg,
            color: itemStyle.text,
          }}>
            {action.labelTH}
          </span>
        ),
      }
    })

  // Display text - use wider placeholder when empty
  const displayText = text || 'เลือก'

  // Check if component should be in disabled state
  const isDisabledState = disabled || menuItems.length === 0 || allFlagsFalse

  // Base button style
  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 3,
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: style.bg,
    color: style.text,
    border: 'none',
    cursor: isDisabledState ? 'default' : 'pointer',
    opacity: isDisabledState ? 0.5 : 1,
    transition: 'background-color 0.2s',
    minWidth: 60,
  }

  // Disabled state: recStatus=1, no actions available, or all flags are false
  // Just show the badge without dropdown (like cancelled document)
  if (isDisabledState) {
    return (
      <span style={buttonStyle}>
        {displayText}
      </span>
    )
  }

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
        style: { minWidth: 140 }
      }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <span
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = style.hoverBg
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = style.bg
        }}
      >
        {displayText}
        <DownOutlined style={{ fontSize: 10 }} />
      </span>
    </Dropdown>
  )
}
