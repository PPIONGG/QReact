import { Card, Typography } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'

const { Title } = Typography

export function PurchaseSummary() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ShoppingCartOutlined style={{ fontSize: 64, color: '#fa8c16', marginBottom: 24 }} />
          <Title level={2}>สรุปยอดซื้อ</Title>
          <Title level={5} type="secondary">
            Purchase Summary
          </Title>
        </div>
      </Card>
    </div>
  )
}
