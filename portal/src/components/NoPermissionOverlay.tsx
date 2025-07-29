import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

interface NoPermissionOverlayProps {
  title?: string;
  subTitle?: string;
  onClose?: () => void;
}

const NoPermissionOverlay: React.FC<NoPermissionOverlayProps> = ({
  title = 'ไม่มีสิทธิ์เข้าถึง',
  subTitle = 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าถึง',
  onClose,
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '90%',
        }}
      >
        <Result
          status="403"
          title={title}
          subTitle={subTitle}
          icon={<LockOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />}
          extra={
            <Button type="primary" size="large" onClick={handleBackToHome}>
              กลับหน้าหลัก
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default NoPermissionOverlay;