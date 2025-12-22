import { Modal, Button, Flex, Typography } from 'antd'
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

export type ConfirmModalType = 'warning' | 'success' | 'error' | 'info'

export interface ConfirmModalProps {
  open: boolean
  title: string
  message: string | ReactNode
  type?: ConfirmModalType
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const TYPE_CONFIG: Record<ConfirmModalType, { icon: ReactNode; color: string }> = {
  warning: { icon: <ExclamationCircleOutlined />, color: '#faad14' },
  success: { icon: <CheckCircleOutlined />, color: '#52c41a' },
  error: { icon: <CloseCircleOutlined />, color: '#ff4d4f' },
  info: { icon: <InfoCircleOutlined />, color: '#1677ff' },
}

export function ConfirmModal({
  open,
  title,
  message,
  type = 'warning',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  confirmLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { icon, color } = TYPE_CONFIG[type]

  return (
    <Modal
      open={open}
      title={
        <Flex align="center" gap={8}>
          <span style={{ color, fontSize: 22 }}>{icon}</span>
          <span>{title}</span>
        </Flex>
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <Button type="primary" onClick={onConfirm} loading={confirmLoading}>
            {confirmText}
          </Button>
          <Button onClick={onCancel} disabled={confirmLoading}>
            {cancelText}
          </Button>
        </Flex>
      }
      onCancel={onCancel}
      centered
      width={400}
      destroyOnHidden
      maskClosable={false}
    >
      <Typography.Text style={{ marginLeft: 30 }}>{message}</Typography.Text>
    </Modal>
  )
}
