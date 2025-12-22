import { Card, Flex, Tabs, Form, Input, Select } from 'antd'
import { HomeOutlined, FileTextOutlined, MessageOutlined, EditOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import type { Warehouse } from '../types'

const { TextArea } = Input

interface POFormTabsProps {
  form: FormInstance
  isExpanded: boolean
  warehouses: Warehouse[]
}

export function POFormTabs({ form, isExpanded, warehouses }: POFormTabsProps) {
  const warehouseTabItems = [
    {
      key: 'billing',
      label: (
        <span>
          <HomeOutlined /> คลังสินค้า
        </span>
      ),
      forceRender: true,
      children: (
        <Flex vertical gap={12}>
          <Form.Item
            label="คลังสินค้า"
            name="billingCode"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: 'กรุณาเลือกคลังสินค้า' }]}
          >
            <Select
              placeholder="เลือกคลังสินค้า"
              showSearch
              optionFilterProp="label"
              options={warehouses.map((w) => ({
                value: w.code,
                label: w.nameT,
              }))}
              onChange={(value) => {
                const selected = warehouses.find((w) => w.code === value)
                form.setFieldValue('billingAddress', selected?.addressThai || '')
              }}
            />
          </Form.Item>
          <Form.Item
            label="ที่อยู่คลังสินค้า"
            name="billingAddress"
            style={{ marginBottom: 0 }}
          >
            <TextArea rows={3} readOnly />
          </Form.Item>
        </Flex>
      ),
    },
    {
      key: 'refDoc',
      label: (
        <span>
          <FileTextOutlined /> เอกสารอ้างอิง
        </span>
      ),
      forceRender: true,
      children: (
        <Flex vertical gap={12}>
          <Form.Item
            label="อ้างอิงผู้ขาย"
            name="supplierRefDoc"
            style={{ marginBottom: 0 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="อ้างอิงบริษัท"
            name="companyRefDoc"
            style={{ marginBottom: 0 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ใบเสนอราคา"
            name="quotationRefDoc"
            style={{ marginBottom: 0 }}
          >
            <Input />
          </Form.Item>
        </Flex>
      ),
    },
  ]

  const noteTabItems = [
    {
      key: 'remark',
      label: (
        <span>
          <MessageOutlined /> หมายเหตุ
        </span>
      ),
      forceRender: true,
      children: (
        <Form.Item name="note" style={{ marginBottom: 0 }}>
          <TextArea rows={4} placeholder="หมายเหตุเพิ่มเติม" />
        </Form.Item>
      ),
    },
    {
      key: 'note',
      label: (
        <span>
          <EditOutlined /> บันทึก
        </span>
      ),
      forceRender: true,
      children: (
        <Form.Item name="memo" style={{ marginBottom: 0 }}>
          <TextArea rows={4} placeholder="บันทึกภายใน" />
        </Form.Item>
      ),
    },
  ]

  return (
    <Flex gap={16} style={{ display: isExpanded ? 'none' : 'flex' }}>
      <Card style={{ flex: 1 }}>
        <Tabs defaultActiveKey="billing" items={warehouseTabItems} />
      </Card>
      <Card style={{ flex: 1 }}>
        <Tabs defaultActiveKey="remark" items={noteTabItems} />
      </Card>
    </Flex>
  )
}
