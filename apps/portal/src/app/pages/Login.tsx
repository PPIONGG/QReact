import React from 'react';
import { Alert, Card } from 'antd';
import { useAuthStore } from '@qreact/store';
import { useTranslation } from '@qreact/i18n';
import BackgroundOverlay from '../components/BackgroundOverlay';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const { login, isLoadingLogin, errorLogin, clearErrorLogin } = useAuthStore();
  const { i18n } = useTranslation();
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

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLanguage);
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
          position: 'relative',
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div
          onClick={toggleLanguage}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#bfbfbf',
            transition: 'color 0.2s ease',
            fontWeight: '500',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#8c8c8c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#bfbfbf';
          }}
          title={`Switch to ${i18n.language === 'th' ? 'English' : 'ไทย'}`}
        >
          {i18n.language}
        </div>

        <LoginHeader />

        {errorLogin && (
          <Alert
            message={errorLogin}
            type="error"
            showIcon
            closable
            onClose={clearErrorLogin}
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
          isLoading={isLoadingLogin}
        />
      </Card>
    </BackgroundOverlay>
  );
}
