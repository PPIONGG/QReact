import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Select, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { LOGIN_TYPE_OPTIONS } from '../constants/auth'
import type { LoginType } from '../types/auth'

const { Title, Text } = Typography

interface LoginFormValues {
  loginType: LoginType
  username: string
  password: string
}

function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form] = Form.useForm()

  // Get the page user tried to access before being redirected to login
  const from = location.state?.from?.pathname || '/home'

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(values.loginType, values.username, values.password)

      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #b30000 50%, #4a0000 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          borderRadius: 12
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#b30000' }}>
              Q-ERPc
            </Title>
            <Text type="secondary">ยินดีต้อนรับสู่ระบบ QERP</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ loginType: 'Q' }}
            size="large"
          >
            <Form.Item
              name="loginType"
              label="ประเภทการเข้าสู่ระบบ"
            >
              <Select
                options={LOGIN_TYPE_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="ชื่อผู้ใช้"
              rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="กรอกชื่อผู้ใช้"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="กรอกรหัสผ่าน"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<LoginOutlined />}
                block
                style={{
                  height: 48,
                  background: 'linear-gradient(135deg, #b30000 0%, #7a0000 100%)',
                  border: 'none',
                  fontWeight: 600,
                  outline: 'none',
                  boxShadow: 'none',
                }}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}

export default Login
