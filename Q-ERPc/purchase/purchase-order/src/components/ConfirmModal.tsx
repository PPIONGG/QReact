import { Modal, Button, Flex, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface ConfirmModalProps {
  open: boolean
  type: 'save' | 'cancel'
  isEditMode: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  type,
  isEditMode,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const getTitle = () => {
    return type === 'save' ? 'ยืนยันการบันทึก' : 'ยืนยันการยกเลิก'
  }

  const getMessage = () => {
    if (type === 'save') {
      return isEditMode
        ? 'ต้องการบันทึกการแก้ไขใบสั่งซื้อหรือไม่?'
        : 'ต้องการบันทึกใบสั่งซื้อหรือไม่?'
    }
    return isEditMode
      ? 'ต้องการยกเลิกการแก้ไขใบสั่งซื้อหรือไม่?'
      : 'ต้องการยกเลิกการสร้างใบสั่งซื้อหรือไม่?'
  }

  return (
    <Modal
      open={open}
      title={
        <Flex align="center" gap={8}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22 }} />
          <span>{getTitle()}</span>
        </Flex>
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <Button type="primary" onClick={onConfirm}>
            {type === 'save' ? 'บันทึก' : 'ยืนยัน'}
          </Button>
          <Button onClick={onCancel}>
            {type === 'save' ? 'ยกเลิก' : 'ไม่'}
          </Button>
        </Flex>
      }
      onCancel={onCancel}
      centered
      width={400}
      destroyOnHidden
      maskClosable={false}
    >
      <Typography.Text style={{ marginLeft: 30 }}>{getMessage()}</Typography.Text>
    </Modal>
  )
}
