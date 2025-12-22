import { Modal, Button, Flex, Typography, Input } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useState, useCallback } from 'react'

const { TextArea } = Input

interface RejectReasonModalProps {
  open: boolean
  confirmLoading?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function RejectReasonModal({
  open,
  confirmLoading = false,
  onConfirm,
  onCancel,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState('')

  const handleAfterClose = useCallback(() => {
    setReason('')
  }, [])

  const handleConfirm = () => {
    onConfirm(reason)
  }

  return (
    <Modal
      open={open}
      title={
        <Flex align="center" gap={8}>
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />
          <span>ไม่อนุมัติ</span>
        </Flex>
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <Button
            type="primary"
            danger
            onClick={handleConfirm}
            loading={confirmLoading}
            disabled={!reason.trim()}
          >
            ยืนยัน
          </Button>
          <Button onClick={onCancel} disabled={confirmLoading}>
            ยกเลิก
          </Button>
        </Flex>
      }
      onCancel={onCancel}
      afterClose={handleAfterClose}
      centered
      width={450}
      destroyOnHidden
      maskClosable={false}
    >
      <div style={{ marginLeft: 30 }}>
        <Typography.Text>กรุณาระบุเหตุผลที่ไม่อนุมัติ</Typography.Text>
        <TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ระบุเหตุผล..."
          rows={3}
          style={{ marginTop: 8 }}
          autoFocus
        />
      </div>
    </Modal>
  )
}
