import { Modal, Button, Flex, Typography, Spin } from 'antd'
import {
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons'
import type { CheckStatusMode } from '../types'

type ModalState = 'confirm' | 'loading' | 'error'

interface CheckStatusModalProps {
  open: boolean
  mode: CheckStatusMode | null
  poNo: string
  state: ModalState
  errorMessage: string | null
  onConfirm: () => void
  onClose: () => void
}

const MODE_CONFIG: Record<
  CheckStatusMode,
  { title: string; message: string; confirmText: string; icon: React.ReactNode }
> = {
  Edit: {
    title: 'ยืนยันการแก้ไข',
    message: 'ต้องการแก้ไขเอกสารนี้หรือไม่?',
    confirmText: 'แก้ไข',
    icon: <EditOutlined style={{ color: '#1890ff', fontSize: 22 }} />,
  },
  Cancel: {
    title: 'ยืนยันการยกเลิก',
    message: 'ต้องการยกเลิกเอกสารนี้หรือไม่?',
    confirmText: 'ยกเลิกเอกสาร',
    icon: <StopOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />,
  },
}

export function CheckStatusModal({
  open,
  mode,
  poNo,
  state,
  errorMessage,
  onConfirm,
  onClose,
}: CheckStatusModalProps) {
  const config = mode ? MODE_CONFIG[mode] : MODE_CONFIG.Edit

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <Flex justify="center" align="center" style={{ padding: '24px 0' }}>
            <Spin size="large" tip="กำลังตรวจสอบสถานะ..." />
          </Flex>
        )
      case 'error':
        return (
          <Typography.Text style={{ marginLeft: 30 }}>
            {errorMessage}
          </Typography.Text>
        )
      default:
        return (
          <Typography.Text style={{ marginLeft: 30 }}>
            ต้องการ{mode === 'Edit' ? 'แก้ไข' : 'ยกเลิก'}เอกสาร <Typography.Text strong>{poNo}</Typography.Text> หรือไม่?
          </Typography.Text>
        )
    }
  }

  const renderFooter = () => {
    if (state === 'loading') {
      return null
    }

    if (state === 'error') {
      return (
        <Flex justify="flex-end">
          <Button onClick={onClose}>ปิด</Button>
        </Flex>
      )
    }

    return (
      <Flex gap={8} justify="flex-end">
        <Button
          type="primary"
          danger={mode === 'Cancel'}
          onClick={onConfirm}
        >
          {config.confirmText}
        </Button>
        <Button onClick={onClose}>ยกเลิก</Button>
      </Flex>
    )
  }

  return (
    <Modal
      open={open}
      title={
        state === 'error' ? (
          <Flex align="center" gap={8}>
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />
            <span>ไม่สามารถดำเนินการได้</span>
          </Flex>
        ) : (
          <Flex align="center" gap={8}>
            {state === 'loading' ? (
              <ExclamationCircleOutlined style={{ color: '#1890ff', fontSize: 22 }} />
            ) : (
              config.icon
            )}
            <span>{state === 'loading' ? 'กำลังตรวจสอบ...' : config.title}</span>
          </Flex>
        )
      }
      onCancel={state === 'loading' ? undefined : onClose}
      centered
      width={420}
      destroyOnHidden
      maskClosable={false}
      closable={state !== 'loading'}
      footer={renderFooter()}
    >
      {renderContent()}
    </Modal>
  )
}
