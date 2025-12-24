import { Card, Table, Typography, Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

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

// Mock data - will be replaced with API call
const visitors: Visitor[] = [
  { id: 1, name: 'สมชาย ใจดี', company: 'บริษัท ABC', date: '2025-12-10' },
  { id: 2, name: 'สมหญิง รักงาน', company: 'บริษัท XYZ', date: '2025-12-09' },
]

interface VisitorListProps {
  canInsert?: boolean
  canEdit?: boolean
}

export function VisitorList({ canInsert = true }: VisitorListProps) {
  const navigate = useNavigate()

  const handleCreate = () => {
    navigate('create')
  }

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 18 }}>
          รายการนัดหมาย Sales Visitor
        </Text>
        {canInsert && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            สร้างนัดหมาย
          </Button>
        )}
      </Flex>

      <Table
        columns={columns}
        dataSource={visitors}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="middle"
        bordered
      />
    </Card>
  )
}
