import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function LoginHeader() {
  return (
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
  );
}
