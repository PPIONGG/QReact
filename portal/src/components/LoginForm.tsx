import { Button, Form, Input, Select } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (values: { username: string; password: string }) => void;
  loginType: 'Q' | 'DB';
  onLoginTypeChange: (type: 'Q' | 'DB') => void;
  isLoading: boolean;
}

export default function LoginForm({
  onSubmit,
  loginType,
  onLoginTypeChange,
  isLoading,
}: LoginFormProps) {
  const { t } = useTranslation('portal-login');
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={onSubmit}
      size="large"
      layout="vertical"
      disabled={isLoading}
    >
      <Form.Item label={<span style={{ fontWeight: 500 }}>{t('userType')}</span>}>
        <Select
          value={loginType}
          onChange={onLoginTypeChange}
          options={[
            { label: 'QERP (Q)', value: 'Q' },
            { label: 'DB', value: 'DB' },
          ]}
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="username"
        label={<span style={{ fontWeight: 500 }}>{t('username')}</span>}
        rules={[{ required: true, message: t('usernameRequired') }]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#b30000' }} />}
          placeholder={t('usernamePlaceholder')}
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
        label={<span style={{ fontWeight: 500 }}>{t('password')}</span>}
        rules={[{ required: true, message: t('passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#b30000' }} />}
          placeholder={t('passwordPlaceholder')}
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
          {t('loginButton')}
        </Button>
      </Form.Item>
    </Form>
  );
}