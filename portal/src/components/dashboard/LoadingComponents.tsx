import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Custom Loading Icon
const CustomLoadingIcon = (
  <LoadingOutlined 
    style={{ 
      fontSize: 48, 
      color: '#1890ff',
      marginBottom: 16 
    }} 
    spin 
  />
);

// Loading Component Options
export const LoadingComponents = {
  // 1. Simple Spin Loading
  Simple: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Spin size="large" indicator={CustomLoadingIcon} />
      <Title level={3} style={{ color: 'white', marginTop: 24, marginBottom: 8 }}>
        กำลังโหลด...
      </Title>
      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
        กรุณารอสักครู่
      </Text>
    </div>
  ),

  // 2. Skeleton Loading with Company Branding
  Branded: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        padding: '20px',
      }}
    >
      {/* Company Logo/Brand */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          fontSize: 32,
          fontWeight: 'bold',
          border: '3px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        Q
      </div>

      {/* Loading Animation */}
      <Spin size="large" indicator={CustomLoadingIcon} />
      
      {/* System Name */}
      <Title level={2} style={{ color: 'white', marginTop: 24, marginBottom: 8 }}>
        QERP SYSTEM
      </Title>
      
      {/* Loading Text */}
      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
        กำลังเตรียมระบบ...
      </Text>

      {/* Loading Dots Animation */}
      <div style={{ marginTop: 20 }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <style>{`
        .loading-dots {
          display: flex;
          gap: 8px;
        }
        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          animation: loading-pulse 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        .loading-dots span:nth-child(3) { animation-delay: 0s; }
        
        @keyframes loading-pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  ),

  // 3. Modern Glassmorphism Loading
  Glassmorphism: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
          `,
          animation: 'float 3s ease-in-out infinite',
        }}
      />

      {/* Glass Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 20,
          padding: '40px 60px',
          textAlign: 'center',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          zIndex: 1,
        }}
      >
        <Spin size="large" indicator={CustomLoadingIcon} />
        <Title level={2} style={{ color: 'white', marginTop: 24, marginBottom: 8 }}>
          QERP SYSTEM
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 }}>
          กำลังเข้าสู่ระบบ...
        </Text>
        
        {/* Progress Bar */}
        <div style={{ marginTop: 24, width: 200 }}>
          <div
            style={{
              height: 4,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00d4ff, #1890ff)',
                borderRadius: 2,
                animation: 'progress 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  ),

  // 4. Minimal Professional Loading
  Professional: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '48px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          minWidth: 300,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Q
        </div>

        <Spin size="large" style={{ marginBottom: 24 }} />
        
        <Title level={3} style={{ color: '#333', marginBottom: 8 }}>
          QERP System
        </Title>
        
        <Text style={{ color: '#666', fontSize: 14 }}>
          กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
        </Text>
      </div>
    </div>
  ),
};

// Default Export - เลือกแบบที่ชอบ
export default LoadingComponents.Branded;