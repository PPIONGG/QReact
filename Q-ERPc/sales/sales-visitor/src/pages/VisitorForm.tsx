import { Card, Form, Input, Button, DatePicker, Flex, Typography } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Text } = Typography

interface VisitorFormProps {
  canEdit?: boolean
}

export function VisitorForm({ canEdit = true }: VisitorFormProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()

  const isEditMode = Boolean(id)

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      console.log('Form values:', values)
      // TODO: Call API to save
      navigate(-1)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} />
          <Text strong style={{ fontSize: 18 }}>
            {isEditMode ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่'}
          </Text>
        </Flex>
        {canEdit && (
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            บันทึก
          </Button>
        )}
      </Flex>

      <Form form={form} layout="vertical" disabled={!canEdit}>
        <Form.Item
          name="name"
          label="ชื่อผู้เยี่ยม"
          rules={[{ required: true, message: 'กรุณากรอกชื่อผู้เยี่ยม' }]}
        >
          <Input placeholder="กรอกชื่อผู้เยี่ยม" />
        </Form.Item>

        <Form.Item
          name="company"
          label="บริษัท"
          rules={[{ required: true, message: 'กรุณากรอกชื่อบริษัท' }]}
        >
          <Input placeholder="กรอกชื่อบริษัท" />
        </Form.Item>

        <Form.Item
          name="date"
          label="วันที่นัดหมาย"
          rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="เลือกวันที่" />
        </Form.Item>

        <Form.Item name="note" label="หมายเหตุ">
          <Input.TextArea rows={4} placeholder="กรอกหมายเหตุ (ถ้ามี)" />
        </Form.Item>
      </Form>
    </Card>
  )
}
