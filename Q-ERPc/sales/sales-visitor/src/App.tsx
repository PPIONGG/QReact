import { Card, Table, Typography, Tag, Space, Descriptions } from 'antd'
import { UserOutlined, SafetyOutlined, BankOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface Company {
  companyCode: string
  companyName: string
  allPermission: boolean
  moduleCodes: string[]
}

interface Permission {
  user: string
  companys: Company[]
}

interface AppProps {
  username?: string
  accessToken?: string
  permission?: Permission | null
}

interface Visitor {
  id: number
  name: string
  company: string
  date: string
}

const columns: ColumnsType<Visitor> = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: 'ชื่อผู้เยี่ยม',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'บริษัท',
    dataIndex: 'company',
    key: 'company',
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    key: 'date',
    width: 120,
  },
]

const visitors: Visitor[] = [
  { id: 1, name: 'สมชาย ใจดี', company: 'บริษัท ABC', date: '2025-12-10' },
  { id: 2, name: 'สมหญิง รักงาน', company: 'บริษัท XYZ', date: '2025-12-09' },
]

function App({ username, accessToken, permission }: AppProps = {}) {
  return (
    <Space
      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
      size="middle"
    >
      {/* User Info Card */}
      {username && (
        <Card size="small">
          <Descriptions
            title={
              <Space>
                <UserOutlined />
                <span>ข้อมูลผู้ใช้งาน</span>
              </Space>
            }
            column={{ xs: 1, sm: 2, md: 3 }}
            size="small"
          >
            <Descriptions.Item label="ผู้ใช้งาน">
              <Text strong>{username}</Text>
            </Descriptions.Item>
            {permission && (
              <>
                <Descriptions.Item label="User ID">
                  {permission.user}
                </Descriptions.Item>
                <Descriptions.Item label="บริษัท">
                  <Space>
                    <BankOutlined />
                    {permission.companys.map((c) => c.companyName).join(', ')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Modules">
                  {permission.companys[0]?.moduleCodes.map((code) => (
                    <Tag key={code} color="blue">
                      {code}
                    </Tag>
                  ))}
                </Descriptions.Item>
              </>
            )}
            {accessToken && (
              <Descriptions.Item label="Token">
                <Space>
                  <SafetyOutlined style={{ color: '#52c41a' }} />
                  <Text code style={{ fontSize: 11 }}>
                    {accessToken.substring(0, 15)}...
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Visitors Table */}
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          รายการนัดหมาย Sales Visitor
        </Title>
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          Remote Module - Sales Visitor Management
        </Text>

        <Table
          columns={columns}
          dataSource={visitors}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
        />
      </Card>

      {/* Info Card */}
      <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Space>
          <Tag color="success">Module Federation</Tag>
          <Text>โหลดจาก Remote (sales-visitor) port 5001</Text>
        </Space>
      </Card>
    </Space>
  )
}

export default App
