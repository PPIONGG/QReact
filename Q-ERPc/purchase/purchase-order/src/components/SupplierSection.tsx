import { Card, Form, Input, Row, Col, Select, InputNumber, DatePicker, Flex, Typography, Button } from 'antd'
import { UserOutlined, SearchOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import type { Dayjs } from 'dayjs'
import type { PaymentTerm, Currency } from '../types'

const { Text } = Typography
const { TextArea } = Input

interface SupplierSectionProps {
  form: FormInstance
  isReadOnly: boolean
  isExpanded: boolean
  paymentTerms: PaymentTerm[]
  currencies: Currency[]
  currencyCode: string | undefined
  poDate: Dayjs | null
  targetShippingDate: Dayjs | null
  onSupplierSearch: () => void
  onPaymentTermChange: (value: string) => void
}

export function SupplierSection({
  form,
  isReadOnly,
  isExpanded,
  paymentTerms,
  currencies,
  currencyCode,
  poDate,
  targetShippingDate,
  onSupplierSearch,
  onPaymentTermChange,
}: SupplierSectionProps) {
  return (
    <Card style={{ marginBottom: 16, display: isExpanded ? 'none' : 'block' }}>
      <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
        </div>
        <Text strong style={{ fontSize: 16 }}>
          ผู้ขาย
        </Text>
      </Flex>

      <Row gutter={[16, 0]}>
        {/* Row 1 */}
        <Col span={8}>
          <Form.Item
            label="รหัสผู้ขาย"
            name="supplierCode"
            rules={[{ required: true, message: 'กรุณาเลือกผู้ขาย' }]}
          >
            <Input
              placeholder="รหัสผู้ขาย"
              readOnly
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={onSupplierSearch}
                  disabled={isReadOnly}
                  style={{ margin: -4 }}
                />
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="เลขที่ใบสั่งซื้อ"
            name="pono"
            rules={[{ required: true, message: 'กรุณาระบุเลขที่ใบสั่งซื้อ' }]}
          >
            <Input placeholder="Auto" readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="วันที่ใบสั่งซื้อ"
            name="podate"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่ใบสั่งซื้อ' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="เลือกวันที่"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                if (targetShippingDate && current) {
                  return current.isAfter(targetShippingDate, 'day')
                }
                return false
              }}
              onChange={() => {
                const paymentTermCode = form.getFieldValue('paymentTermCode')
                if (paymentTermCode) {
                  onPaymentTermChange(paymentTermCode)
                }
              }}
            />
          </Form.Item>
        </Col>

        {/* Row 2 */}
        <Col span={8}>
          <Form.Item label="ชื่อผู้ขาย" name="supplierName">
            <Input placeholder="ชื่อผู้ขาย" readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="กำหนดส่งผู้สั่งซื้อ" name="targetShippingDate">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="เลือกวันที่"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                if (poDate && current) {
                  return current.isBefore(poDate, 'day')
                }
                return false
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8} />

        {/* Row 3 */}
        <Col span={8}>
          <Form.Item label="ที่อยู่" name="fullAddress">
            <TextArea rows={3} placeholder="ที่อยู่" readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="รหัสชำระ"
            name="paymentTermCode"
            rules={[{ required: true, message: 'กรุณาเลือกรหัสชำระ' }]}
          >
            <Select
              placeholder="เลือกรหัสชำระ"
              allowClear
              showSearch
              optionFilterProp="label"
              options={paymentTerms.map((pt) => ({
                value: pt.code,
                label: pt.descriptionOnSalesThai,
              }))}
              onChange={onPaymentTermChange}
            />
          </Form.Item>
        </Col>
        <Col span={8} />

        {/* Row 4 */}
        <Col span={8}>
          <Form.Item label="โทรศัพท์" name="supplierPhone">
            <Input placeholder="เบอร์โทร" readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="วันที่ชำระ" name="paymentDueDate">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="เลือกวันที่"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                if (poDate && current) {
                  return current.isBefore(poDate, 'day')
                }
                return false
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="อ้างอิงชำระ" name="paymentTermRefDoc">
            <Input placeholder="อ้างอิงชำระ" />
          </Form.Item>
        </Col>

        {/* Row 5 */}
        <Col span={8}>
          <Form.Item label="ผู้ติดต่อ" name="contactName">
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label="สกุลเงิน"
            name="currencyCode"
            rules={[{ required: true, message: 'กรุณาเลือกสกุลเงิน' }]}
          >
            <Select
              placeholder="เลือกสกุลเงิน"
              showSearch
              optionFilterProp="label"
              options={currencies.map((c) => ({
                value: c.code,
                label: `${c.code} - ${c.t}`,
              }))}
              onChange={(value) => {
                if (value === 'THB') {
                  form.setFieldValue('exchangeRate', 1)
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="อัตราแลกเปลี่ยน" name="exchangeRate">
            <InputNumber
              style={{ width: '100%' }}
              className="input-number-right"
              placeholder="1"
              min={0}
              precision={4}
              disabled={isReadOnly || currencyCode === 'THB'}
            />
          </Form.Item>
        </Col>
        <Col span={8} />
      </Row>
    </Card>
  )
}
