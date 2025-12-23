import { Card, Typography } from 'antd'
import { RiseOutlined } from '@ant-design/icons'

const { Title } = Typography

export function SalesSummary() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <RiseOutlined style={{ fontSize: 64, color: '#eb2f96', marginBottom: 24 }} />
          <Title level={2}>สรุปยอดขาย</Title>
          <Title level={5} type="secondary">
            Sales Summary
          </Title>
        </div>
      </Card>
    </div>
  )
}
