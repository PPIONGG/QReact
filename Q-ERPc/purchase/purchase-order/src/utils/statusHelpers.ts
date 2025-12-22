/**
 * Status helper functions for displaying status tags
 */

import type { ApprovedAction } from '../types'

export interface StatusResult {
  text: string
  color: string
}

// Color mapping based on action type
const ACTION_TYPE_COLORS: Record<string, string> = {
  Complete: 'green',
  UnComplete: 'red',
  Process: 'orange',
  Request: 'blue',
}

/**
 * Get approval status display info (default fallback)
 */
export const getApprovalStatus = (status: string): StatusResult => {
  switch (status) {
    case 'Y':
      return { text: 'อนุมัติ', color: 'green' }
    case 'W':
      return { text: 'รออนุมัติ', color: 'orange' }
    case 'N':
      return { text: 'ไม่อนุมัติ', color: 'red' }
    case 'P':
      return { text: 'ขอร้อง', color: 'blue' }
    default:
      return { text: '', color: 'default' }
  }
}

/**
 * Get approval status display info from config actions
 */
export const getApprovalStatusFromConfig = (status: string, actions: ApprovedAction[]): StatusResult => {
  const action = actions.find((a) => a.value === status)
  if (action) {
    return {
      text: action.labelTH,
      color: ACTION_TYPE_COLORS[action.type] || 'default',
    }
  }
  return getApprovalStatus(status)
}

/**
 * Get delivery status display info
 */
export const getDeliveryStatus = (status: string): StatusResult => {
  switch (status) {
    case 'Y':
      return { text: 'รับแล้ว', color: 'green' }
    case 'P':
      return { text: 'รับบางส่วน', color: 'orange' }
    default:
      return { text: 'ยังไม่รับ', color: 'default' }
  }
}

/**
 * Get record status display info
 */
export const getRecStatus = (status: number): StatusResult => {
  switch (status) {
    case 0:
      return { text: 'ปกติ', color: 'green' }
    case 1:
      return { text: 'ยกเลิก', color: 'red' }
    default:
      return { text: '-', color: 'default' }
  }
}
