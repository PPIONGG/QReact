import { Card, Typography } from 'antd'
import { DollarOutlined } from '@ant-design/icons'

const { Title } = Typography

export function FinancialReport() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <DollarOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
          <Title level={2}>รายงานการเงิน</Title>
          <Title level={5} type="secondary">
            Financial Report
          </Title>
        </div>
      </Card>
    </div>
  )
}
