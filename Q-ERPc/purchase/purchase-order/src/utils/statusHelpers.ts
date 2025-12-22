/**
 * Status helper functions for displaying status tags
 */

export interface StatusResult {
  text: string
  color: string
}

/**
 * Get approval status display info
 */
export const getApprovalStatus = (status: string): StatusResult => {
  switch (status) {
    case 'Y':
      return { text: 'อนุมัติ', color: 'green' }
    case 'W':
      return { text: 'รออนุมัติ', color: 'orange' }
    case 'N':
      return { text: 'ไม่อนุมัติ', color: 'red' }
    default:
      return { text: 'ร่าง', color: 'blue' }
  }
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
