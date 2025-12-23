import { Card, Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Title } = Typography

export function Inventory() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <InboxOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          <Title level={2}>สินค้าคงคลัง</Title>
          <Title level={5} type="secondary">
            Inventory
          </Title>
        </div>
      </Card>
    </div>
  )
}
