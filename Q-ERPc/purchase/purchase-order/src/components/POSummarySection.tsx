import { Card, Flex, Typography, Form, Input, InputNumber, Checkbox } from 'antd'
import type { FormInstance } from 'antd'
import {
  formatNumber,
  formatNegativeNumber,
  parseNumberForInput,
  parseNegativeNumberForInput,
} from '../utils'

const { Text } = Typography

interface POSummarySectionProps {
  form: FormInstance
  currencyCode: string | undefined
  isReadOnly: boolean
  adjustVatEnabled: boolean
}

export function POSummarySection({
  form,
  currencyCode,
  isReadOnly,
  adjustVatEnabled,
}: POSummarySectionProps) {
  return (
    <Flex justify="flex-end" style={{ marginTop: 16 }}>
      <Card style={{ width: 'fit-content', backgroundColor: '#f0f5ff' }}>
        <Flex vertical gap={12}>
          {/* Header Row */}
          <Flex align="center" gap={16}>
            <div style={{ width: 270 }} />
            <Text strong style={{ width: 150, textAlign: 'right' }}>
              {currencyCode || 'สกุลเงิน'}
            </Text>
            <Text strong style={{ width: 150, textAlign: 'right' }}>
              บาท
            </Text>
          </Flex>

          {/* รวมมูลค่า */}
          <Flex align="center" gap={16}>
            <Text strong style={{ width: 270, textAlign: 'left' }}>
              รวมมูลค่า:
            </Text>
            <Form.Item name="totalAmountCurrency" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
            <Form.Item name="totalAmountBeforeVATBaht" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
          </Flex>

          {/* ส่วนลด */}
          <Flex align="center" gap={16}>
            <Flex align="center" gap={8} style={{ width: 270 }}>
              <Text strong style={{ textAlign: 'left' }}>
                ส่วนลด:
              </Text>
              <Form.Item name="discountStringBeforeVAT" noStyle>
                <Input
                  style={{ width: 80, textAlign: 'right' }}
                  disabled={isReadOnly}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
                    if (allowedKeys.includes(e.key)) return

                    const regex = /^[0-9.%]$/
                    if (!regex.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  onBlur={(e) => {
                    let value = e.target.value.trim()
                    if (value && !value.includes('%')) {
                      const num = parseFloat(value)
                      if (!isNaN(num)) {
                        value = num.toFixed(2)
                        form.setFieldValue('discountStringBeforeVAT', value)
                      }
                    }
                  }}
                />
              </Form.Item>
              <Text strong style={{ textAlign: 'left', color: 'red' }}>
                จำนวนลด:
              </Text>
            </Flex>
            <Form.Item name="amountDiscountCurrency" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right input-number-red"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNegativeNumber}
                parser={parseNegativeNumberForInput}
              />
            </Form.Item>
            <Form.Item name="amountDiscountBaht" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right input-number-red"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNegativeNumber}
                parser={parseNegativeNumberForInput}
              />
            </Form.Item>
          </Flex>

          {/* ยอดเงินหลังลด */}
          <Flex align="center" gap={16}>
            <Text strong style={{ width: 270, textAlign: 'left' }}>
              ยอดเงินหลังลด:
            </Text>
            <Form.Item name="totalAmountCurrencyAfterDiscountBeforeVAT" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
            <Form.Item name="totalAmountBahtAfterDiscountBeforeVAT" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
          </Flex>

          {/* ภาษีมูลค่าเพิ่ม */}
          <Flex align="center" gap={16}>
            <Flex align="center" gap={8} style={{ width: 300 }}>
              <Text strong style={{ textAlign: 'left' }}>
                ภาษีมูลค่าเพิ่ม:
              </Text>
              <Form.Item name="vatRate" noStyle>
                <Input
                  style={{ width: 70, textAlign: 'right' }}
                  disabled={isReadOnly}
                  onChange={(e) => {
                    const value = e.target.value
                    const regex = /^[0-9]*\.?[0-9]*$/
                    if (!regex.test(value) && value !== '') {
                      e.preventDefault()
                    }
                  }}
                />
              </Form.Item>
              <Text strong style={{ textAlign: 'left' }}>
                %
              </Text>
            </Flex>
            <div style={{ width: 100 }} />
            <div style={{ width: 150 }} />
          </Flex>

          {/* ฐานภาษี */}
          <Flex align="center" gap={16}>
            <Flex align="center" gap={8} style={{ width: 270 }}>
              <Text strong style={{ whiteSpace: 'nowrap' }}>
                ฐานภาษี:
              </Text>
              <Form.Item name="vatBasedForVATAmountCurrency" noStyle>
                <Input
                  style={{ width: 100, textAlign: 'right' }}
                  readOnly
                  onBlur={(e) => {
                    let value = e.target.value.trim()
                    if (value) {
                      const num = parseFloat(value)
                      if (!isNaN(num)) {
                        value = num.toFixed(2)
                        form.setFieldValue('vatBasedForVATAmountCurrency', value)
                      }
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="adjustVatEnabled" valuePropName="checked" noStyle>
                <Checkbox disabled={isReadOnly}>
                  <Text strong>แก้ไขภาษี</Text>
                </Checkbox>
              </Form.Item>
            </Flex>

            <Form.Item name="vatAmountCurrency" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly={!adjustVatEnabled || isReadOnly}
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
            <Form.Item name="vatAmountBaht" noStyle>
              <InputNumber
                style={{ width: 150 }}
                className="input-number-right"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
          </Flex>

          {/* รวมเงินทั้งสิ้น */}
          <Flex
            align="center"
            gap={16}
            style={{
              backgroundColor: '#1e3a5f',
              padding: '12px 16px',
              margin: '8px -24px -24px -24px',
              borderRadius: '0 0 8px 8px',
            }}
          >
            <Text
              strong
              style={{ width: 220, textAlign: 'left', color: '#fff', fontSize: 18 }}
            >
              รวมเงินทั้งสิ้น
            </Text>
            <Form.Item name="totalAmountCurrencyAfterVAT" noStyle>
              <InputNumber
                style={{ width: 150, fontSize: 18, fontWeight: 'bold' }}
                className="input-number-right summary-total-input"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
            <Form.Item name="totalAmountAfterVATBaht" noStyle>
              <InputNumber
                style={{ width: 150, fontSize: 18, fontWeight: 'bold' }}
                className="input-number-right summary-total-input"
                placeholder="0.00"
                precision={2}
                readOnly
                formatter={formatNumber}
                parser={parseNumberForInput}
              />
            </Form.Item>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}
