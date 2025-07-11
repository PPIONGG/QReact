import { Button, Card, Typography } from 'antd';
import { useTranslation } from '@qreact/i18n';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { t: tLogin, i18n } = useTranslation('portal-login');
  const { t: tDashboard } = useTranslation('portal-dashboard');

  // ฟังก์ชันสลับภาษา
  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLanguage);
  };

  // แสดงธงชาติ
  const getCurrentFlag = () => {
    return i18n.language === 'th' ? '🇹🇭' : '🇺🇸';
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* ปุ่มเล็กสุด - มุมขวาบน */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '20px' 
      }}>
        <Button
          shape="circle"
          size="small"
          onClick={toggleLanguage}
          style={{
            width: '32px',
            height: '32px',
            fontSize: '14px',
            border: '1px solid #d9d9d9',
            background: 'white',
            minWidth: 'auto'
          }}
        >
          {getCurrentFlag()}
        </Button>
      </div>

      {/* ทดสอบ Login */}
      <Card title="🔐 Portal Login" style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            {tLogin('title')}
          </Title>
          
          <Text style={{ 
            fontSize: '16px', 
            color: '#666', 
            display: 'block', 
            marginBottom: '20px' 
          }}>
            {tLogin('subtitle')}
          </Text>

          <Button type="primary" size="large">
            {tLogin('loginButton')}
          </Button>
        </div>
      </Card>

      {/* ทดสอบ Dashboard */}
      <Card title="📊 Portal Dashboard">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3} style={{ color: '#52c41a' }}>
            {tDashboard('title')}
          </Title>
          
          <Text style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#fa8c16',
            display: 'block',
            marginBottom: '10px'
          }}>
            🎉 {tDashboard('welcome')}
          </Text>
          
          <Text style={{ 
            fontSize: '14px', 
            color: '#8c8c8c', 
            fontStyle: 'italic' 
          }}>
            💡 {tDashboard('selectMenu')}
          </Text>
        </div>
      </Card>
    </div>
  );
}