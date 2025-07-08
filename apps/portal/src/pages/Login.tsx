import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Select,
  Typography,
} from 'antd';

const { Title, Text } = Typography;

export default function Login() {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #fff 0%, #ffeaea 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(0,0,0,0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card
          style={{
            width: 420,
            boxShadow:
              '0 20px 40px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.05)',
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
          styles={{ body: { padding: '32px' } }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title
              level={2}
              style={{
                marginBottom: '8px',
                color: '#b30000',
                fontSize: '28px',
                fontWeight: 600,
              }}
            >
              ระบบจัดการองค์กร
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', color: '#666' }}>
              กรุณาเข้าสู่ระบบเพื่อใช้งาน
            </Text>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{
                marginBottom: '24px',
                borderRadius: '8px',
                border: 'none',
              }}
            />
          )}

          {/* Login Form */}
          <Form
            form={form}
            onFinish={handleSubmit}
            size="large"
            layout="vertical"
            disabled={isLoading}
          >
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>ประเภทผู้ใช้</span>}
            >
              <Select
                value={loginType}
                onChange={(val) => setLoginType(val)}
                options={[
                  { label: 'QERP (Q)', value: 'Q' },
                  { label: 'DB', value: 'DB' },
                ]}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 500 }}>ชื่อผู้ใช้</span>}
              rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#b30000' }} />}
                placeholder="กรอกชื่อผู้ใช้"
                autoComplete="username"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  backgroundColor: 'white',
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 500 }}>รหัสผ่าน</span>}
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#b30000' }} />}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  backgroundColor: 'white',
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '24px', marginTop: '32px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                size="large"
                icon={!isLoading && <LoginOutlined />}
                style={{
                  background: '#b30000',
                  border: 'none',
                  height: '52px',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(179, 0, 0, 0.3)',
                }}
              >
                เข้าสู่ระบบ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
