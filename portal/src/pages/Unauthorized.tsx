import { Result, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Result
        status="403"
        icon={<LockOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        title="ไม่มีสิทธิ์เข้าถึง"
        subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง"
        extra={
          <Button type="primary" onClick={() => navigate('/home')}>
            กลับหน้าหลัก
          </Button>
        }
      />
    </div>
  )
}

export default Unauthorized
