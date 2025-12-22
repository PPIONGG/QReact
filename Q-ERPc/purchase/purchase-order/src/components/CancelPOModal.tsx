import { Modal, Button, Flex, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { POHeader } from '../types'

interface CancelPOModalProps {
  open: boolean
  selectedPO: POHeader | null
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CancelPOModal({
  open,
  selectedPO,
  isLoading,
  onConfirm,
  onClose,
}: CancelPOModalProps) {
  return (
    <Modal
      open={open}
      title={
        <Flex align="center" gap={8}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22 }} />
          <span>ยืนยันการยกเลิกใบสั่งซื้อ</span>
        </Flex>
      }
      onCancel={onClose}
      centered
      width={400}
      destroyOnHidden
      maskClosable={false}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button danger type="primary" loading={isLoading} onClick={onConfirm}>
            ยืนยัน
          </Button>
          <Button onClick={onClose}>ยกเลิก</Button>
        </Flex>
      }
    >
      <Typography.Text style={{ marginLeft: 30 }}>
        ต้องการยกเลิกใบสั่งซื้อ {selectedPO?.pono} หรือไม่?
      </Typography.Text>
    </Modal>
  )
}
