import React from 'react';
import { Alert, Card } from 'antd';
import { useAuthStore } from '../store/auth.store';
import BackgroundOverlay from '../components/BackgroundOverlay';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [loginType, setLoginType] = React.useState<'Q' | 'DB'>('Q');

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    await login(values.username, values.password, loginType);
  };

  const handleLoginTypeChange = (type: 'Q' | 'DB') => {
    setLoginType(type);
  };

  return (
    <BackgroundOverlay>
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
        <LoginHeader />

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

        <LoginForm
          onSubmit={handleSubmit}
          loginType={loginType}
          onLoginTypeChange={handleLoginTypeChange}
          isLoading={isLoading}
        />
      </Card>
    </BackgroundOverlay>
  );
}
