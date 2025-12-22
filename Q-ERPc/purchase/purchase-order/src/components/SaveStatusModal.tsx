import { Modal, Flex, Spin, Typography, Result, Button } from 'antd'

export type SaveStatus = 'saving' | 'success' | 'error'

interface SaveStatusModalProps {
  open: boolean
  status: SaveStatus
  errorMessage: string
  isEditMode: boolean
  onClose: () => void
}

export function SaveStatusModal({
  open,
  status,
  errorMessage,
  isEditMode,
  onClose,
}: SaveStatusModalProps) {
  return (
    <Modal
      open={open}
      footer={null}
      closable={status === 'error'}
      onCancel={onClose}
      centered
      width={400}
    >
      {status === 'saving' && (
        <Flex vertical align="center" gap={16} style={{ padding: '24px 0' }}>
          <Spin size="large" />
          <Typography.Text style={{ fontSize: 16 }}>
            กำลังบันทึกข้อมูล...
          </Typography.Text>
        </Flex>
      )}
      {status === 'success' && (
        <Result
          status="success"
          title="บันทึกสำเร็จ"
          subTitle={
            isEditMode
              ? 'อัปเดตใบสั่งซื้อเรียบร้อยแล้ว'
              : 'สร้างใบสั่งซื้อเรียบร้อยแล้ว'
          }
        />
      )}
      {status === 'error' && (
        <Result
          status="error"
          title="บันทึกไม่สำเร็จ"
          subTitle={errorMessage}
          extra={
            <Button type="primary" onClick={onClose}>
              ปิด
            </Button>
          }
        />
      )}
    </Modal>
  )
}
